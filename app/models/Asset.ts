
import mongoose, { Document, Model, Schema, models } from 'mongoose';
import './Tenant'; // Ensure Tenant model is registered

export interface IAsset extends Document {
  tenant: mongoose.Schema.Types.ObjectId;
  serialNumber: string;
  assetNo?: string;
  make?: string;
  model?: string;
  macAddress?: string;
  purchaseDate?: Date;
  status: 'available' | 'allotted' | 'replacement' | 'defective' | 'damaged' | 'other';
  allottedTo?: {
    name: string;
    email: string;
    registrationNumber?: string;
    mobileNumber?: string;
    building?: string;
    floor?: string;
    roomNumber?: string;
    course?: 'LLB' | 'LLM' | 'MBA' | 'PHD' | 'Other';
  };
  complaintId?: string;
  allotmentDate?: Date;
  notes?: string;
  // New Fields
  location?: string;
  department?: string;
  purchaseOrderNumber?: string;
  purchaseCost?: number;
  vendor?: string;
  warrantyEndDate?: Date;
  // Compliance Fields
  lastVerifiedAt?: Date;
  verificationValidUntil?: Date;
}

const AssetSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  serialNumber: { type: String, required: true },
  assetNo: { type: String },
  make: { type: String },
  model: { type: String },
  macAddress: { type: String },
  purchaseDate: { type: Date },
  status: { type: String, enum: ['available', 'allotted', 'replacement', 'defective', 'damaged', 'other'], default: 'available' },
  allottedTo: {
    name: { type: String },
    email: { type: String },
    registrationNumber: { type: String },
    mobileNumber: { type: String },
    building: { type: String },
    floor: { type: String },
    roomNumber: { type: String },
    course: { type: String, enum: ['LLB', 'LLM', 'MBA', 'PHD', 'Other'] },
  },
  complaintId: { type: String },
  allotmentDate: { type: Date },
  notes: { type: String },
  // New Fields
  location: { type: String },
  department: { type: String },
  purchaseOrderNumber: { type: String },
  purchaseCost: { type: Number },
  vendor: { type: String },
  warrantyEndDate: { type: Date },
  // Compliance Fields
  lastVerifiedAt: { type: Date },
  verificationValidUntil: { type: Date },
}, { timestamps: true });

AssetSchema.index({ tenant: 1, serialNumber: 1 }, { unique: true });
AssetSchema.index({ tenant: 1, assetNo: 1 }, { unique: true, sparse: true });


const Asset: Model<IAsset> = models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default Asset;
