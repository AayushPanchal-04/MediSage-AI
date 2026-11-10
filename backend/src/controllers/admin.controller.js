import * as adminService from '../services/admin.service.js';
import { ok } from '../utils/apiResponse.js';
import { toAuditDto, toDoctorDto, toPatientDto, toUserDto } from '../utils/serializers.js';

export const getAllUsers = async (_req, res) =>
  ok(res, 'Users fetched', (await adminService.getAllUsers()).map(toUserDto));

export const getAllDoctors = async (_req, res) =>
  ok(res, 'Doctors fetched', (await adminService.getAllDoctors()).map(toDoctorDto));

export const getAllPatients = async (_req, res) =>
  ok(res, 'Patients fetched', (await adminService.getAllPatients()).map(toPatientDto));

// PUT /assign-doctor  {patientId, doctorId}   (original contract)
// POST /assign-patient?patientId=&doctorId=   (what the React admin screen actually calls)
export const assignDoctor = async (req, res) => {
  const patientId = req.body?.patientId ?? req.query.patientId;
  const doctorId = req.body?.doctorId ?? req.query.doctorId;
  await adminService.assignDoctor(
    patientId === undefined ? undefined : String(patientId),
    doctorId === undefined ? undefined : String(doctorId),
  );
  return ok(res, 'Doctor assigned successfully', null);
};

export const deactivate = async (req, res) => {
  await adminService.deactivateUser(req.params.userId);
  return ok(res, 'User deactivated', null);
};

export const getAuditLogs = async (_req, res) =>
  ok(res, 'Audit logs fetched', (await adminService.getAuditLogs()).map(toAuditDto));
