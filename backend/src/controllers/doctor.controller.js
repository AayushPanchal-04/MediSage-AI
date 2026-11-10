import * as doctorService from '../services/doctor.service.js';
import { ok } from '../utils/apiResponse.js';
import { toDoctorDto, toPatientDto, toRecordDto } from '../utils/serializers.js';

export const getMyPatients = async (req, res) => {
  const patients = await doctorService.getMyPatients(req.user);
  return ok(res, 'Patients fetched', patients.map(toPatientDto));
};

export const getPatientRecords = async (req, res) => {
  const records = await doctorService.getPatientRecords(req.user, req.params.id);
  return ok(res, 'Records fetched', records.map(toRecordDto));
};

export const getPatientSummary = async (req, res) =>
  ok(res, 'Summary generated', await doctorService.generatePatientSummary(req.user, req.params.id));

export const getProfile = async (req, res) =>
  ok(res, 'Profile fetched', toDoctorDto(await doctorService.getDoctorByUser(req.user)));
