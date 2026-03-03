
import mongoose, { Document, Model, Schema, models } from 'mongoose';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../lib/crypto';
import './Tenant'; // Ensure Tenant model is registered
import { ITenant } from './Tenant';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional on document, but required for creation
  avatar?: string;
  role: 'engineer' | 'admin' | 'super-admin' | 'viewer' | 'sales' | 'hod' | 'micro-admin' | 'nano-admin' | 'user';
  status: 'active' | 'inactive' | 'on-leave';
  phone?: string;
  tenant: ITenant | mongoose.Schema.Types.ObjectId; // Can be populated
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
  comparePassword(candidate: string): Promise<boolean>;
  emailConfig: {
    imapHost?: string;
    imapPort?: number;
    imapUser?: string;
    imapPassword?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
  }
  // Security features
  failedLoginAttempts: number;
  lastFailedLogin?: Date;
  isLocked: boolean;
  lockedUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin?: Date;
  recordFailedLogin(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isAccountLocked(): boolean;
}

const EmailConfigSchema: Schema = new Schema({
    imapHost: { type: String },
    imapPort: { type: Number },
    imapUser: { type: String },
    imapPassword: { type: String },
    smtpHost: { type: String },
    smtpPort: { type: Number },
    smtpUser: { type: String },
    smtpPassword: { type: String },
});


const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String },
  role: { type: String, enum: ['engineer', 'admin', 'super-admin', 'viewer', 'sales', 'hod', 'micro-admin', 'nano-admin', 'user'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  phone: { type: String },
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  isVerified: { type: Boolean, default: false },
  emailConfig: { type: EmailConfigSchema, select: false },
  // Security fields
  failedLoginAttempts: { type: Number, default: 0 },
  lastFailedLogin: { type: Date, default: null },
  isLocked: { type: Boolean, default: false, index: true },
  lockedUntil: { type: Date, default: null },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

// Hash password before saving if it has been modified
UserSchema.pre<IUser>('save', async function(next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Encrypt email config passwords on save
UserSchema.pre<IUser>('save', function (next) {
    if (this.isModified('emailConfig.imapPassword') && this.emailConfig.imapPassword) {
        this.emailConfig.imapPassword = encrypt(this.emailConfig.imapPassword);
    }
    if (this.isModified('emailConfig.smtpPassword') && this.emailConfig.smtpPassword) {
        this.emailConfig.smtpPassword = encrypt(this.emailConfig.smtpPassword);
    }
    next();
});

// Method to compare password for login
UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Record a failed login attempt and lock account if too many attempts
UserSchema.methods.recordFailedLogin = async function (): Promise<void> {
    this.failedLoginAttempts += 1;
    this.lastFailedLogin = new Date();

    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 5) {
        this.isLocked = true;
        this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }

    await this.save();
};

// Reset login attempts after successful login
UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
    this.failedLoginAttempts = 0;
    this.lastFailedLogin = undefined;
    this.isLocked = false;
    this.lockedUntil = undefined;
    this.lastLogin = new Date();
    await this.save();
};

// Check if account is locked
UserSchema.methods.isAccountLocked = function (): boolean {
    if (!this.isLocked) return false;
    
    // Check if lock has expired
    if (this.lockedUntil && new Date() > this.lockedUntil) {
        this.isLocked = false;
        this.lockedUntil = undefined;
        this.failedLoginAttempts = 0;
        return false;
    }
    
    return true;
};

// Add indexes for security queries
UserSchema.index({ isLocked: 1, lockedUntil: 1 });
UserSchema.index({ email: 1, isVerified: 1 });

const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
