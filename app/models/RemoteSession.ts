import mongoose, { Document, Schema, models } from 'mongoose';
import './Tenant';
import './User';
import './Complaint';

export interface IRemoteSession extends Document {
  id: string;
  tenant: mongoose.Schema.Types.ObjectId;
  complaint: mongoose.Schema.Types.ObjectId;
  engineer: mongoose.Schema.Types.ObjectId;
  complainer: mongoose.Schema.Types.ObjectId;
  
  // Session Status
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  
  // Session Details
  reason?: string;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  
  // Control Permissions
  controlLevel: 'view-only' | 'mouse-only' | 'full-control';
  canShareScreen: boolean;
  canShareAudio: boolean;
  allowRemoteInput: boolean;
  allowScreenRecording: boolean;
  
  // Live Streaming Signaling
  isBroadcasting: boolean;
  streamStartedAt?: Date;

  // Session Data
  recordingUrl?: string;
  recordingSize?: number; // in bytes
  transcriptUrl?: string;
  chatMessages: Array<{
    sender: string;
    senderName: string;
    message: string;
    timestamp: Date;
    messageType: 'text' | 'system';
  }>;
  
  // Session Activity
  actionsLog: Array<{
    action: string;
    timestamp: Date;
    details?: any;
  }>;
  
  // Timestamps
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RemoteSessionSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    complaint: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
    engineer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    complainer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },
    
    reason: { type: String },
    estimatedDuration: { type: Number }, // minutes
    actualDuration: { type: Number }, // minutes
    
    controlLevel: {
      type: String,
      enum: ['view-only', 'mouse-only', 'full-control'],
      default: 'view-only',
    },
    canShareScreen: { type: Boolean, default: true },
    canShareAudio: { type: Boolean, default: true },
    allowRemoteInput: { type: Boolean, default: false },
    allowScreenRecording: { type: Boolean, default: true },

    isBroadcasting: { type: Boolean, default: false },
    streamStartedAt: { type: Date },
    
    recordingUrl: { type: String },
    recordingSize: { type: Number },
    transcriptUrl: { type: String },
    
    chatMessages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        messageType: {
          type: String,
          enum: ['text', 'system'],
          default: 'text',
        },
      },
    ],
    
    actionsLog: [
      {
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: Schema.Types.Mixed },
      },
    ],
    
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// Index for faster queries
RemoteSessionSchema.index({ tenant: 1, complaint: 1 });
RemoteSessionSchema.index({ engineer: 1, status: 1 });
RemoteSessionSchema.index({ complainer: 1, status: 1 });
RemoteSessionSchema.index({ requestedAt: -1 });

export default models.RemoteSession || mongoose.model<IRemoteSession>('RemoteSession', RemoteSessionSchema);