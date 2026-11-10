import mongoose from 'mongoose';
import { AuditAction } from './enums.js';

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, enum: Object.values(AuditAction) },
  // Original column held either a record id or (for doctor VIEW) a patient id, so keep it a string.
  targetRecordId: { type: String, default: null },
  details: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
