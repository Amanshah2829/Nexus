import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  error?: string;
  tenant?: string;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'EXPORT',
        'IMPORT',
        'SECURITY_EVENT_LOW',
        'SECURITY_EVENT_MEDIUM',
        'SECURITY_EVENT_HIGH',
        'SECURITY_EVENT_CRITICAL',
      ],
      index: true,
    },
    resource: {
      type: String,
      required: true,
      enum: [
        'COMPLAINT',
        'REMOTE_SESSION',
        'USER',
        'SETTINGS',
        'REPORT',
        'INVENTORY',
        'SECURITY',
      ],
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
    changes: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failure'],
      default: 'success',
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    tenant: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: 'auditlogs',
  }
);

// Compound index for efficient queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });
auditLogSchema.index({ tenant: 1, timestamp: -1 });

// TTL index - automatically delete logs older than 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
