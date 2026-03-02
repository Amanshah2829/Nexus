
import mongoose, { Document, Model, Schema, models } from 'mongoose';
import './Tenant'; // Ensure Tenant model is registered

export interface ISetting extends Document {
  tenant?: mongoose.Schema.Types.ObjectId; // Make tenant optional for global settings
  key: string;
  value: any;
}

const SettingSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' }, // Not required, allowing for global settings
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

// This compound index ensures that for a given tenant, a key is unique.
// It also allows multiple documents to have a null tenant field (for global settings)
// as long as the key is unique among them.
SettingSchema.index({ key: 1, tenant: 1 }, { unique: true });


const Setting: Model<ISetting> = models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;
