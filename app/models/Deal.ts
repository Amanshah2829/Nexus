
import mongoose, { Document, Model, Schema, models } from 'mongoose';
import './Lead';

export interface IDeal extends Document {
  name: string;
  lead: mongoose.Schema.Types.ObjectId;
  stage: 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  amount: number;
  closeDate: Date;
  owner: mongoose.Schema.Types.ObjectId;
}

const DealSchema: Schema = new Schema({
  name: { type: String, required: true },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  stage: { 
    type: String, 
    enum: ['qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'], 
    required: true 
  },
  amount: { type: Number, required: true },
  closeDate: { type: Date, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Deal: Model<IDeal> = models.Deal || mongoose.model<IDeal>('Deal', DealSchema);

export default Deal;
