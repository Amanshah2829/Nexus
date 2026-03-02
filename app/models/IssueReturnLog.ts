
import mongoose, { Document, Model, Schema, models } from 'mongoose';

export interface IAssetLog extends Document {
  asset: mongoose.Schema.Types.ObjectId;
  action: 'created' | 'issued' | 'returned' | 'status_change' | 'updated';
  user?: string; // User performing the action (e.g., engineer name, 'System')
  details?: {
    from?: any;
    to?: any;
    message?: string;
    allottedTo?: {
      name: string;
      email?: string;
      registrationNumber?: string;
      mobileNumber?: string;
    };
    complaintId?: string;
  };
  timestamp: Date;
}

const AssetLogSchema: Schema = new Schema({
  asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  action: { type: String, enum: ['created', 'issued', 'returned', 'status_change', 'updated'], required: true },
  user: { type: String },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

const AssetLog: Model<IAssetLog> = models.AssetLog || mongoose.model<IAssetLog>('AssetLog', AssetLogSchema);

export default AssetLog;
