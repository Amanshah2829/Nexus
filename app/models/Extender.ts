
import mongoose, { Document, Model, Schema, models } from 'mongoose';
import './Tenant'; // Ensure Tenant model is registered

export interface IExtender extends Document {
  tenant: mongoose.Schema.Types.ObjectId;
  serialNumber: string;
  assetNo?: string;
  make?: string;
  model?: string;
  macAddress?: string;
  purchaseDate?: Date;
  status: 'available' | 'allotted' | 'defective';
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
}

const ExtenderSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  serialNumber: { type: String, required: true },
  assetNo: { type: String, sparse: true },
  make: { type: String },
  model: { type: String },
  macAddress: { type: String, sparse: true },
  purchaseDate: { type: Date },
  status: { type: String, enum: ['available', 'allotted', 'defective'], default: 'available' },
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
}, { timestamps: true });

ExtenderSchema.index({ tenant: 1, serialNumber: 1 }, { unique: true });
ExtenderSchema.index({ tenant: 1, macAddress: 1 }, { unique: true, sparse: true });

const Extender: Model<IExtender> = models.Extender || mongoose.model<IExtender>('Extender', ExtenderSchema);

export default Extender;
