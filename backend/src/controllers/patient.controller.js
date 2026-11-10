import * as patientService from '../services/patient.service.js';
import { ok } from '../utils/apiResponse.js';
import { badRequest } from '../utils/errors.js';
import { validateChat } from '../utils/validators.js';
import { toChatDto, toPatientDto, toRecordDto } from '../utils/serializers.js';

export const getRecords = async (req, res) => {
  const records = await patientService.getMyRecords(req.user);
  return ok(res, 'Records fetched', records.map(toRecordDto));
};

export const uploadRecord = async (req, res) => {
  if (!req.file) throw badRequest('File is required');
  const { reportType, reportName, visitDate } = req.body ?? {};
  const record = await patientService.uploadRecord(req.user, req.file, {
    reportType,
    reportName,
    visitDate,
  });
  return ok(res, 'Record uploaded and analysed', toRecordDto(record));
};

export const getSummary = async (req, res) =>
  ok(res, 'Summary generated', await patientService.getFullSummary(req.user));

export const chat = async (req, res) => {
  const { message } = validateChat(req.body ?? {});
  const saved = await patientService.chat(req.user, message);
  return ok(res, 'AI response', toChatDto(saved));
};

export const getChatHistory = async (req, res) => {
  const history = await patientService.getChatHistory(req.user);
  return ok(res, 'Chat history', history.map((h) => toChatDto({ ...h.toObject(), user: req.user })));
};

export const getProfile = async (req, res) =>
  ok(res, 'Profile fetched', toPatientDto(await patientService.getPatientProfile(req.user)));
