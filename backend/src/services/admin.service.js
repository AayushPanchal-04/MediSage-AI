// Port of service/AdminService.java
import { User, Patient, Doctor, AuditLog } from '../models/index.js';
import { notFound } from '../utils/errors.js';
import { isObjectId } from '../utils/ids.js';

export const getAllUsers = () => User.find().sort({ _id: 1 });

export const getAllDoctors = () => Doctor.find().sort({ _id: 1 }).populate('user');

export const getAllPatients = () =>
  Patient.find()
    .sort({ _id: 1 })
    .populate('user')
    .populate({ path: 'assignedDoctor', populate: { path: 'user' } });

export async function assignDoctor(patientId, doctorId) {
  const patient = isObjectId(patientId) ? await Patient.findById(patientId) : null;
  if (!patient) throw notFound('Patient not found');
  const doctor = isObjectId(doctorId) ? await Doctor.findById(doctorId) : null;
  if (!doctor) throw notFound('Doctor not found');

  patient.assignedDoctor = doctor._id;
  await patient.save();
}

export async function deactivateUser(userId) {
  const user = isObjectId(userId) ? await User.findById(userId) : null;
  if (!user) throw notFound('User not found');
  user.active = false;
  await user.save();
}

export const getAuditLogs = () => AuditLog.find().sort({ timestamp: -1, _id: -1 }).populate('user');
