
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

const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
