// Port of service/AuditService.java
import { AuditLog } from '../models/index.js';

export async function log(user, action, recordId, details) {
  await AuditLog.create({
    user: user._id,
    action,
    targetRecordId: recordId === null || recordId === undefined ? null : String(recordId),
    details,
  });
}
