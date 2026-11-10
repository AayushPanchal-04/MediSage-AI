// Port of service/PatientService.java
import {
  Patient,
  MedicalRecord,
  AiSummary,
  ChatHistory,
  RecordStatus,
  AuditAction,
} from '../models/index.js';
import { badRequest, notFound } from '../utils/errors.js';
import { parseDateOnly, todayDateOnly } from '../utils/dates.js';
import * as aiService from './ai.service.js';
import * as fileService from './file.service.js';
import * as audit from './audit.service.js';

const NEWEST_FIRST = { createdAt: -1, _id: -1 };

// Long pathology PDFs blow past Groq's per-request size limit (HTTP 413), so cap what we send.
const MAX_REPORT_CHARS = 12_000;

// The model sometimes labels a vital "HIGH"/"LOW" instead of "ANOMALY", so trust the anomalies list first.
function hasAnomalies(extractedJson) {
  try {
    const root = JSON.parse(extractedJson);
    if (Array.isArray(root?.anomalies) && root.anomalies.length > 0) return true;
    return (root?.vitals ?? []).some((v) => /ANOMALY|CRITICAL/i.test(String(v?.status)));
  } catch {
    return extractedJson.includes('ANOMALY');
  }
}

// Java: records.forEach(r -> context.append(r.getExtractedData()).append("\n"))
export const buildContext = (records) =>
  records.map((r) => `${r.extractedData ?? 'null'}\n`).join('');

export async function getPatientByUser(user) {
  const patient = await Patient.findOne({ user: user._id });
  if (!patient) throw notFound('Patient profile not found');
  return patient;
}

/** GET /patient/profile — Patient with user + assigned doctor populated for the DTO. */
export async function getPatientProfile(user) {
  const patient = await Patient.findOne({ user: user._id })
    .populate('user')
    .populate({ path: 'assignedDoctor', populate: { path: 'user' } });
  if (!patient) throw notFound('Patient profile not found');
  return patient;
}

export async function getMyRecords(user) {
  const patient = await getPatientByUser(user);
  await audit.log(user, AuditAction.VIEW, null, 'Viewed all records');
  return MedicalRecord.find({ patient: patient._id }).sort(NEWEST_FIRST);
}

export async function uploadRecord(user, file, { reportType, reportName, visitDate }) {
  fileService.validateFile(file);
  if (reportType === undefined || reportType === null) {
    throw badRequest("Required parameter 'reportType' is not present");
  }
  const parsedVisitDate = parseDateOnly(visitDate, 'visitDate');
  const patient = await getPatientByUser(user);

  // Save file locally (swap with S3 in production)
  const fileUrl = await fileService.saveFile(file);

  let record;
  let extractedJson;
  try {
    // Extract text from PDF
    let extractedText;
    if (fileService.isPdf(file)) {
      try {
        extractedText = await fileService.extractTextFromPdf(file);
      } catch (err) {
        console.error('PDF text extraction failed:', err.message);
        throw badRequest('Unable to read the PDF file — it may be corrupted or password protected');
      }
    } else {
      extractedText = 'Image file — text extraction requires Vision API';
    }

    // Structured data extraction via the LLM
    extractedJson = await aiService.extractMedicalData(extractedText.slice(0, MAX_REPORT_CHARS));

    // Determine status from extracted data
    const status = hasAnomalies(extractedJson) ? RecordStatus.WARNING : RecordStatus.NORMAL;

    // Save record
    record = await MedicalRecord.create({
      patient: patient._id,
      reportType,
      reportName: reportName ?? file.originalname,
      visitDate: parsedVisitDate ?? todayDateOnly(),
      fileUrl,
      originalFileName: file.originalname,
      extractedData: extractedJson,
      status,
    });
  } catch (err) {
    await fileService.deleteFile(fileUrl).catch(() => {}); // don't leave an orphan file behind
    throw err;
  }

  // Save AI summary
  let summaryText = 'Clinical summary pending...';
  try {
    const root = JSON.parse(extractedJson);
    if (root !== null && typeof root === 'object' && 'summary' in root) {
      summaryText = String(root.summary); // JsonNode.asText()
    }
  } catch {
    // fallback if the AI returned something that isn't JSON
  }

  await AiSummary.create({
    record: record._id,
    summaryText,
    anomalies: extractedJson, // original stores the whole extracted JSON here
    confidenceScore: 0.92,
  });

  await audit.log(user, AuditAction.UPLOAD, record._id, `Uploaded ${reportType}`);
  return record;
}

export async function getFullSummary(user) {
  const patient = await getPatientByUser(user);
  const records = await MedicalRecord.find({ patient: patient._id }).sort(NEWEST_FIRST).limit(6);

  if (records.length === 0) return '{"message": "No records found"}';
  return aiService.generatePatientSummary(buildContext(records));
}

export async function chat(user, message) {
  const patient = await getPatientByUser(user);
  const records = await MedicalRecord.find({ patient: patient._id }).sort(NEWEST_FIRST).limit(6);

  const aiResponse = await aiService.chat(message, buildContext(records));

  const saved = await ChatHistory.create({ user: user._id, userMessage: message, aiResponse });
  return { ...saved.toObject(), user }; // user attached for the DTO (password is never serialised)
}

export async function getChatHistory(user) {
  return ChatHistory.find({ user: user._id }).sort({ timestamp: 1, _id: 1 });
}
