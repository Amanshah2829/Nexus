
import mongoose, { Document, Model, Schema, models } from 'mongoose';
import './Complaint'; // Ensure Complaint model is registered
import './User'; // Ensure User model is registered

export interface ISolution extends Document {
  tenant: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  resolution: string;
  tags?: string[];
  complaintId?: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const SolutionSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  resolution: { type: String, required: true },
  tags: [{ type: String }],
  complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

SolutionSchema.index({ tenant: 1, title: 'text', description: 'text', resolution: 'text', category: 'text', tags: 'text' });

const Solution: Model<ISolution> = models.Solution || mongoose.model<ISolution>('Solution', SolutionSchema);

export default Solution;
