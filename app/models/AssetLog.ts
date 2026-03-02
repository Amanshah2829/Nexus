
import mongoose, { Document, Model, Schema, models } from 'mongoose';
import './Asset'; // Ensure Asset model is registered

// New Discrepancy Interface
export interface IDiscrepancy {
  type: "SERIAL_MISMATCH" | "MISSING" | "DAMAGED" | "LOCATION_MISMATCH" | "OTHER";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
}

export interface IAssetLog extends Document {
  tenant: mongoose.Schema.Types.ObjectId;
  asset: mongoose.Schema.Types.ObjectId;
  action: 'created' | 'issued' | 'returned' | 'status_change' | 'updated' | 'verification';
  user: string; // For verification, this is the 'verifiedBy' user
  details?: any; // Keep this for backward compatibility and general notes
  timestamp: Date;
  
  // --- Compliance Fields ---
  verificationResult?: 'PASS' | 'PASS_WITH_OBSERVATION' | 'FAIL';
  discrepancies?: IDiscrepancy[];
  
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

const DiscrepancySchema = new Schema<IDiscrepancy>({
  type: { type: String, required: true },
  severity: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

const AssetLogSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  action: { type: String, enum: ['created', 'issued', 'returned', 'status_change', 'updated', 'verification'], required: true },
  user: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, required: true },
  
  // --- Compliance Fields ---
  verificationResult: { type: String, enum: ['PASS', 'PASS_WITH_OBSERVATION', 'FAIL'] },
  discrepancies: [DiscrepancySchema],
  reviewStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  reviewNotes: { type: String },

}, { timestamps: true });

AssetLogSchema.index({ tenant: 1, asset: 1 });
AssetLogSchema.index({ verificationResult: 1, reviewStatus: 1 });


const AssetLog: Model<IAssetLog> = models.AssetLog || mongoose.model<IAssetLog>('AssetLog', AssetLogSchema);

export default AssetLog;
