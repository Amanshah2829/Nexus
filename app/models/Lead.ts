
import mongoose, { Document, Model, Schema, models } from 'mongoose';
import './User';

export interface ILead extends Document {
  company: string;
  contactName: string;
  email?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  source?: string;
  value?: number;
  owner?: mongoose.Schema.Types.ObjectId;
  lastContacted?: Date;
  createdAt: Date;
}

const LeadSchema: Schema = new Schema({
  company: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'], 
    default: 'new' 
  },
  source: { type: String },
  value: { type: Number, default: 0 },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  lastContacted: { type: Date },
}, { timestamps: true });

const Lead: Model<ILead> = models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
