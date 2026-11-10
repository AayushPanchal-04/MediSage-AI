// Port of service/DoctorService.java
import { Doctor, Patient, MedicalRecord, AuditAction } from '../models/index.js';
import { notFound } from '../utils/errors.js';
import { isObjectId } from '../utils/ids.js';
import * as aiService from './ai.service.js';
import * as audit from './audit.service.js';
import { buildContext } from './patient.service.js';

const NEWEST_FIRST = { createdAt: -1, _id: -1 };

export async function getDoctorByUser(user) {
  const doctor = await Doctor.findOne({ user: user._id }).populate('user');
  if (!doctor) throw notFound('Doctor profile not found');
  return doctor;
}

export async function getMyPatients(user) {
  const doctor = await getDoctorByUser(user);
  return Patient.find({ assignedDoctor: doctor._id })
    .sort({ _id: 1 })
    .populate('user')
    .populate({ path: 'assignedDoctor', populate: { path: 'user' } });
}

async function requirePatient(patientId) {
  const patient = isObjectId(patientId) ? await Patient.findById(patientId) : null;
  if (!patient) throw notFound('Patient not found');
  return patient;
}

export async function getPatientRecords(user, patientId) {
  await getDoctorByUser(user); // 404 "Doctor profile not found" if the caller has no doctor profile
  await requirePatient(patientId);

  await audit.log(user, AuditAction.VIEW, patientId, 'Doctor viewed patient records');

  return MedicalRecord.find({ patient: patientId }).sort(NEWEST_FIRST);
}

export async function generatePatientSummary(user, patientId) {
  await requirePatient(patientId);

  const records = await MedicalRecord.find({ patient: patientId }).sort(NEWEST_FIRST).limit(6);
  if (records.length === 0) return '{"message": "No records available"}';

  await audit.log(
    user,
    AuditAction.GENERATE_SUMMARY,
    patientId,
    `Generated AI summary for patient ${patientId}`,
  );

  return aiService.generatePatientSummary(buildContext(records));
}
