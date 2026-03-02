
import mongoose, { Document, Model, Schema, models } from 'mongoose';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface ITenant extends Document {
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  locations: string[];
  permissions?: {
    engineer?: string[];
  };
  branding?: {
    enabled: boolean;
    companyName?: string;
    tagline?: string;
    logoUrl?: string;
    address?: Address;
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
  };
  // From onboarding
  industry?: string;
  companySize?: string;
  address?: Address;
  // Subscription details
  subscriptionPlan: 'trial' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trialing';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  monthlyCost?: number;
  createdAt: Date;
}

const AddressSchema: Schema = new Schema({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
}, { _id: false });


const BrandingSchema: Schema = new Schema({
  enabled: { type: Boolean, default: false },
  companyName: { type: String },
  tagline: { type: String },
  logoUrl: { type: String },
  address: { type: AddressSchema },
  primaryColor: { type: String },
  accentColor: { type: String },
  backgroundColor: { type: String },
}, { _id: false });

const TenantSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  locations: [{ type: String }],
  permissions: {
    engineer: [{ type: String }],
  },
  branding: { type: BrandingSchema },
  industry: { type: String },
  companySize: { type: String },
  address: { type: AddressSchema },
  subscriptionPlan: { type: String, enum: ['trial', 'basic', 'pro', 'enterprise'], default: 'trial' },
  subscriptionStatus: { type: String, enum: ['active', 'past_due', 'canceled', 'trialing'], default: 'trialing' },
  subscriptionStartDate: { type: Date, default: Date.now },
  subscriptionEndDate: { type: Date },
  monthlyCost: { type: Number, default: 0 },
}, { timestamps: true });

const Tenant: Model<ITenant> = models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);

export default Tenant;
