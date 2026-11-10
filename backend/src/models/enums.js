// Ports of entity/Enum/*.java
export const Role = Object.freeze({ PATIENT: 'PATIENT', DOCTOR: 'DOCTOR', ADMIN: 'ADMIN' });
export const RecordStatus = Object.freeze({
  NORMAL: 'NORMAL',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  PENDING: 'PENDING',
});
export const AuditAction = Object.freeze({
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  UPLOAD: 'UPLOAD',
  VIEW: 'VIEW',
  DELETE: 'DELETE',
  ASSIGN: 'ASSIGN',
  GENERATE_SUMMARY: 'GENERATE_SUMMARY',
});
