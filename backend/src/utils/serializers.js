// Response shapes.
//
// The original Spring service returned raw JPA entities. Two problems with that, both fixed here
// without changing any endpoint, field name or business rule:
//   1. Entities carried the BCrypt password hash (User) and had cyclic references
//      (Patient -> Doctor -> patients -> Patient ...), which cannot be serialised safely.
//   2. The React UI reads some flattened fields (`name`, `email`, `dob`, `createdAt`, `targetId`)
//      that the entities never exposed.
// So every DTO below keeps ALL original fields and ADDS those UI aliases. Passwords are never emitted.
import { formatDateOnly } from './dates.js';

const idOf = (v) => (v == null ? null : String(v._id ?? v));
const isPopulated = (v) => v != null && typeof v === 'object' && v.fullName !== undefined;

export function toUserDto(u) {
  if (!u) return null;
  if (!isPopulated(u)) return { id: idOf(u) }; // not populated — id only
  return {
    id: idOf(u),
    fullName: u.fullName,
    name: u.fullName, // alias used by the UI
    email: u.email,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export function toDoctorDto(d) {
  if (!d) return null;
  const user = toUserDto(d.user);
  return {
    id: idOf(d),
    user,
    specialization: d.specialization,
    licenseNumber: d.licenseNumber,
    hospitalAffiliation: d.hospitalAffiliation,
    // UI aliases
    name: user?.fullName,
    email: user?.email,
  };
}

export function toPatientDto(p) {
  if (!p) return null;
  const user = toUserDto(p.user);
  const dob = formatDateOnly(p.dateOfBirth);
  return {
    id: idOf(p),
    user,
    dateOfBirth: dob,
    bloodGroup: p.bloodGroup,
    allergies: p.allergies, // comma-separated string, exactly as stored/registered
    assignedDoctor: p.assignedDoctor ? toDoctorDto(p.assignedDoctor) : null,
    // UI aliases
    name: user?.fullName,
    email: user?.email,
    dob,
  };
}

// MedicalRecord: the entity @JsonIgnore'd patient, doctor and aiSummary — same here.
export function toRecordDto(r) {
  if (!r) return null;
  return {
    id: idOf(r),
    reportType: r.reportType,
    reportName: r.reportName,
    visitDate: formatDateOnly(r.visitDate),
    fileUrl: r.fileUrl,
    originalFileName: r.originalFileName,
    extractedData: r.extractedData, // JSON string
    status: r.status,
    createdAt: r.createdAt,
  };
}

export function toChatDto(c) {
  if (!c) return null;
  return {
    id: idOf(c),
    user: toUserDto(c.user),
    userMessage: c.userMessage,
    aiResponse: c.aiResponse,
    timestamp: c.timestamp,
  };
}

export function toAuditDto(a) {
  if (!a) return null;
  return {
    id: idOf(a),
    user: toUserDto(a.user),
    action: a.action,
    targetRecordId: a.targetRecordId,
    details: a.details,
    timestamp: a.timestamp,
    // UI aliases
    createdAt: a.timestamp,
    targetId: a.targetRecordId,
  };
}
