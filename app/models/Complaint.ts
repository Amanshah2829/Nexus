
import mongoose, { Document, Model, Schema, models } from 'mongoose';
import './Tenant'; // Ensure Tenant model is registered

export interface IHistory {
    action: string;
    user: string;
    timestamp: Date;
    details?: any;
}

export interface IComplaint extends Document {
  id: string;
  tenant: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  type: 'complaint' | 'request';
  status: 'created' | 'scheduled' | 'visited' | 'observation' | 'follow-up' | 'closed' | 'pending-info' | 'pending-approval' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  building?: string;
  room?: string;
  reporter: string;
  reporterEmail: string;
  phone?: string;
  createdAt: Date;
  scheduledAt?: Date;
  visitedAt?: Date;
  assignedTo?: mongoose.Schema.Types.ObjectId;
  category: string;
  ticketNumber: string;
  attachments: string[];
  history: IHistory[];
  originalEmailMessageId?: string;
  originalEmailReferences?: string | string[];
  resolvedAt?: Date;
}

const HistorySchema: Schema = new Schema({
    action: { type: String, required: true },
    user: { type: String, required: true },
    timestamp: { type: Date, required: true },
    details: { type: Schema.Types.Mixed },
});


const ComplaintSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['complaint', 'request'], default: 'complaint' },
  status: { type: String, enum: ['created', 'scheduled', 'visited', 'observation', 'follow-up', 'closed', 'pending-info', 'pending-approval', 'archived'], default: 'created' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  building: { type: String },
  room: { type: String },
  reporter: { type: String, required: true },
  reporterEmail: { type: String, required: true },
  phone: { type: String },
  scheduledAt: { type: Date },
  visitedAt: { type: Date },
  resolvedAt: { type: Date },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  category: { type: String },
  ticketNumber: { type: String, required: true, unique: true },
  attachments: [{ type: String }],
  history: [HistorySchema],
  originalEmailMessageId: { type: String },
  originalEmailReferences: { type: Schema.Types.Mixed },
}, { timestamps: true });

// Add a text index to the subject field for better search performance
ComplaintSchema.index({ id: 'text', ticketNumber: 'text', title: 'text' });
ComplaintSchema.index({ tenant: 1 });


const Complaint: Model<IComplaint> = models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;
