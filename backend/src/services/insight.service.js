// The AI insight features added on top of the original three (extraction, patient summary, chat).
// Every result is cached in AiInsight and refreshed automatically when the underlying reports change.
import crypto from 'node:crypto';
import { Patient, MedicalRecord, AiInsight, AuditAction } from '../models/index.js';
import { badRequest, notFound } from '../utils/errors.js';
import { isObjectId } from '../utils/ids.js';
import { formatDateOnly } from '../utils/dates.js';
import * as aiService from './ai.service.js';
import * as audit from './audit.service.js';
import { getPatientByUser } from './patient.service.js';

const NEWEST_FIRST = { createdAt: -1, _id: -1 };
const OLDEST_FIRST = { visitDate: 1, createdAt: 1, _id: 1 };

const MAX_RECORDS = 24; // history depth we are willing to send to the model
const MAX_CONTEXT_CHARS = 12_000; // same per-request cap as the upload pipeline

export const InsightType = Object.freeze({
  SYMPTOM: 'SYMPTOM',
  MEDICATION: 'MEDICATION',
  CARE_PLAN: 'CARE_PLAN',
  RISK: 'RISK',
  MONTHLY: 'MONTHLY',
  COMPARE: 'COMPARE',
  POPULATION: 'POPULATION',
});

const hash = (value) => crypto.createHash('sha1').update(String(value)).digest('hex');

/** Parses an AI JSON payload, degrading gracefully when the model answered with prose. */
function parseAi(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed !== null && typeof parsed === 'object' ? parsed : { message: String(text) };
  } catch {
    return { message: String(text ?? '') };
  }
}

function ageFrom(dateOfBirth) {
  if (!dateOfBirth) return 'unknown';
  const years = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000));
  return years >= 0 && years < 130 ? String(years) : 'unknown';
}

function describePatient(patient, user) {
  return [
    `Patient: ${user?.fullName ?? 'Unknown'}`,
    `Age: ${ageFrom(patient.dateOfBirth)}`,
    `Blood group: ${patient.bloodGroup || 'unknown'}`,
    `Known allergies: ${patient.allergies || 'none recorded'}`,
  ].join('\n');
}

/** One line per report — the same shape the original buildContext() used. */
function contextOf(records) {
  return records.map((r) => `${r.extractedData ?? 'null'}\n`).join('').slice(0, MAX_CONTEXT_CHARS);
}

const recordsOf = (patientId, limit = MAX_RECORDS) =>
  MedicalRecord.find({ patient: patientId }).sort(NEWEST_FIRST).limit(limit);

function monthLabel(date) {
  const d = new Date(date ?? Date.now());
  if (Number.isNaN(d.getTime())) return 'undated';
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Groups records into calendar months, oldest first, with a deterministic anomaly count. */
function buildMonthlyData(records) {
  const months = new Map();
  for (const r of records) {
    const key = monthLabel(r.visitDate ?? r.createdAt);
    if (!months.has(key)) months.set(key, { month: key, reports: [] });
    const extracted = parseAi(r.extractedData);
    months.get(key).reports.push({
      reportType: r.reportType,
      reportName: r.reportName,
      date: formatDateOnly(r.visitDate),
      extracted,
    });
  }

  return [...months.values()].map((m) => ({
    month: m.month,
    reportCount: m.reports.length,
    anomalyCount: m.reports.reduce(
      (total, rep) => total + (Array.isArray(rep.extracted.anomalies) ? rep.extracted.anomalies.length : 0),
      0,
    ),
    reports: m.reports,
  }));
}

/**
 * Returns the cached insight for `key`, regenerating only when the input fingerprint changed
 * (or when `force` is set). Keeps page views off the Groq quota.
 */
async function cachedAi({ type, patient = null, key, input, generate, force = false, user }) {
  const sourceHash = hash(input);
  const existing = await AiInsight.findOne({ key });

  if (!force && existing?.payload && existing.sourceHash === sourceHash) {
    if (user) await audit.log(user, AuditAction.VIEW, null, `Viewed AI ${type} insight`);
    return parseAi(existing.payload);
  }

  const payload = await generate();
  await AiInsight.findOneAndUpdate(
    { key },
    { key, patient, type, payload, sourceHash, generatedAt: new Date() },
    { upsert: true },
  );
  if (user) await audit.log(user, AuditAction.GENERATE_SUMMARY, null, `Generated AI ${type} insight`);

  return parseAi(payload);
}

const assertHasRecords = (records) => {
  if (records.length === 0) {
    throw badRequest('Upload at least one medical report before using this feature');
  }
};

// ── Symptom triage ───────────────────────────────────────────────────
export async function symptomTriage(user, symptoms, force = false) {
  const complaint = String(symptoms ?? '').trim();
  if (complaint.length < 3) throw badRequest('symptoms: must describe how you are feeling');

  const patient = await getPatientByUser(user);
  const records = await recordsOf(patient._id);
  const profile = describePatient(patient, user);
  const context = contextOf(records);

  return cachedAi({
    type: InsightType.SYMPTOM,
    patient: patient._id,
    key: `${InsightType.SYMPTOM}:patient:${patient._id}:${hash(complaint).slice(0, 10)}`,
    input: `${profile}\n${complaint}\n${context}`,
    generate: () => aiService.analyzeSymptoms(complaint, `${profile}\n\n${context || 'No records uploaded.'}`),
    force,
    user,
  });
}

// ── Medication safety review ─────────────────────────────────────────
export async function medicationSafety(user, force = false) {
  const patient = await getPatientByUser(user);
  const records = await recordsOf(patient._id);
  assertHasRecords(records);

  const profile = describePatient(patient, user);
  const context = contextOf(records);

  return cachedAi({
    type: InsightType.MEDICATION,
    patient: patient._id,
    key: `${InsightType.MEDICATION}:patient:${patient._id}`,
    input: `${profile}\n${context}`,
    generate: () => aiService.analyzeMedications(`${profile}\n\n${context}`),
    force,
    user,
  });
}

// ── Care plan ────────────────────────────────────────────────────────
export async function carePlan(user, force = false) {
  const patient = await getPatientByUser(user);
  const records = await recordsOf(patient._id);
  assertHasRecords(records);

  const profile = describePatient(patient, user);
  const context = contextOf(records);

  return cachedAi({
    type: InsightType.CARE_PLAN,
    patient: patient._id,
    key: `${InsightType.CARE_PLAN}:patient:${patient._id}`,
    input: `${profile}\n${context}`,
    generate: () => aiService.generateCarePlan(`${profile}\n\n${context}`),
    force,
    user,
  });
}

// ── Risk score (patient view + doctor view) ──────────────────────────
async function riskOf(patient, user, force) {
  const records = await recordsOf(patient._id);
  assertHasRecords(records);

  const profile = describePatient(patient, user);
  const context = contextOf(records);

  return cachedAi({
    type: InsightType.RISK,
    patient: patient._id,
    key: `${InsightType.RISK}:patient:${patient._id}`,
    input: `${profile}\n${context}`,
    generate: () => aiService.scorePatientRisk(`${profile}\n\n${context}`),
    force,
    user,
  });
}

export async function myRisk(user, force = false) {
  return riskOf(await getPatientByUser(user), user, force);
}

export async function riskById(patientId, force = false) {
  if (!isObjectId(patientId)) throw notFound('Patient not found');
  const patient = await Patient.findById(patientId).populate('user');
  if (!patient) throw notFound('Patient not found');
  return riskOf(patient, patient.user, force);
}

// ── Compare one report against every earlier report ──────────────────
export async function compareRecord(user, recordId, force = false) {
  const patient = await getPatientByUser(user);
  if (!isObjectId(recordId)) throw notFound('Record not found');

  const timeline = await MedicalRecord.find({ patient: patient._id }).sort(OLDEST_FIRST);
  const index = timeline.findIndex((r) => String(r._id) === String(recordId));
  if (index === -1) throw notFound('Record not found');

  const current = timeline[index];
  const previous = timeline.slice(0, index);

  if (previous.length === 0) {
    return { hasPrevious: false, message: 'This is the earliest report — upload another one to see a comparison.' };
  }

  const currentJson = `${formatDateOnly(current.visitDate)} | ${current.reportType}\n${current.extractedData}`;
  const previousJson = previous
    .map((r) => `${formatDateOnly(r.visitDate)} | ${r.reportType}\n${r.extractedData}`)
    .join('\n')
    .slice(0, MAX_CONTEXT_CHARS);

  const analysis = await cachedAi({
    type: InsightType.COMPARE,
    patient: patient._id,
    key: `${InsightType.COMPARE}:record:${current._id}`,
    input: `${currentJson}\n${previousJson}`,
    generate: () => aiService.compareReports(currentJson, previousJson),
    force,
    user,
  });

  return {
    hasPrevious: true,
    current: { id: String(current._id), date: formatDateOnly(current.visitDate), reportType: current.reportType },
    comparedWith: previous.map((r) => ({
      id: String(r._id),
      date: formatDateOnly(r.visitDate),
      reportType: r.reportType,
      reportName: r.reportName,
    })),
    analysis,
  };
}

// ── Month-by-month analysis of the full history ──────────────────────
export async function monthlyTrends(user, force = false) {
  const patient = await getPatientByUser(user);
  const records = await MedicalRecord.find({ patient: patient._id }).sort(OLDEST_FIRST);
  assertHasRecords(records);

  const months = buildMonthlyData(records);
  const series = months.map(({ month, reportCount, anomalyCount }) => ({ month, reportCount, anomalyCount }));
  const detail = JSON.stringify(months).slice(0, MAX_CONTEXT_CHARS);

  const analysis = await cachedAi({
    type: InsightType.MONTHLY,
    patient: patient._id,
    key: `${InsightType.MONTHLY}:patient:${patient._id}`,
    input: `${describePatient(patient, user)}\n${detail}`,
    generate: () => aiService.analyzeMonthlyTrends(detail),
    force,
    user,
  });

  return { months: series, analysis };
}

// ── Admin: population insights ───────────────────────────────────────
export async function population(user, force = false) {
  const patients = await Patient.find().sort({ _id: 1 }).limit(40).populate('user');
  const records = await MedicalRecord.find().sort(NEWEST_FIRST).limit(200);

  if (patients.length === 0 || records.length === 0) {
    throw badRequest('No patient data available yet');
  }

  const byPatient = new Map();
  for (const r of records) {
    const id = String(r.patient);
    if (!byPatient.has(id)) byPatient.set(id, []);
    byPatient.get(id).push(r);
  }

  const cohort = patients
    .map((p) => {
      const own = byPatient.get(String(p._id)) ?? [];
      return JSON.stringify({
        patient: p.user?.fullName ?? 'Unknown',
        age: ageFrom(p.dateOfBirth),
        bloodGroup: p.bloodGroup || 'unknown',
        allergies: p.allergies || 'none recorded',
        reportCount: own.length,
        reports: own.map((r) => ({
          reportType: r.reportType,
          status: r.status,
          date: formatDateOnly(r.visitDate),
          extracted: parseAi(r.extractedData),
        })),
      });
    })
    .join('\n')
    .slice(0, MAX_CONTEXT_CHARS);

  const stats = [
    `Patients: ${patients.length}`,
    `Reports: ${records.length}`,
    `Records flagged WARNING: ${records.filter((r) => r.status === 'WARNING').length}`,
    `Records awaiting analysis: ${records.filter((r) => r.status === 'PENDING').length}`,
  ].join('\n');

  return cachedAi({
    type: InsightType.POPULATION,
    key: `${InsightType.POPULATION}:global`,
    input: `${stats}\n${cohort}`,
    generate: () => aiService.populationInsights(`${stats}\n\n${cohort}`),
    force,
    user,
  });
}

// ── Voice chat: transcribe a recording to text ───────────────────────
export async function transcribe(file) {
  if (!file) throw badRequest('Audio file is required');
  const text = await aiService.transcribeAudio(file);
  if (!text) throw badRequest('Could not transcribe that recording — please try again or type your question');
  return text;
}
