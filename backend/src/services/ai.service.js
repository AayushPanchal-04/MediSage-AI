// Port of service/AiService.java — same prompts, same Groq request, same fence stripping,
// same graceful failure payload. All three methods return a *string* (JSON text or chat text).
import { env } from '../config/env.js';

const AI_UNAVAILABLE = '{"error": "AI service temporarily unavailable"}';
const GROQ_TIMEOUT_MS = 60_000;

// ── Extract structured data from report text ─────────────────────────
export function extractMedicalData(reportText) {
  const prompt =
    [
      'You are a medical data extraction AI. From the report text below, extract:',
      '1. Patient vitals: hemoglobin, glucose, blood pressure, cholesterol (with units)',
      '2. Diagnosis or conditions noted',
      '3. Medications prescribed with dosage',
      '4. Doctor name and date of the report',
      '5. Flag any value outside the normal range as ANOMALY',
      '',
      'Return ONLY valid JSON in this exact format, no explanation:',
      '{',
      '  "summary": "A 4-5 line overview of the patient\'s health status based on this report. Use simple, easy-to-understand language and avoid complex medical jargon.",',
      '  "vitals": [{"name": "Glucose", "value": "110", "unit": "mg/dL", "normalRange": "70-100", "status": "ANOMALY"}],',
      '  "diagnosis": ["Type 2 Diabetes - early stage"],',
      '  "medications": [{"name": "Metformin", "dosage": "500mg", "frequency": "twice daily"}],',
      '  "doctorName": "Dr. Smith",',
      '  "reportDate": "2025-01-15",',
      '  "anomalies": ["Glucose: 110 mg/dL - above normal range"]',
      '}',
      '',
      'Report text:',
      '',
    ].join('\n') + reportText;

  return callGroq(prompt);
}

// ── Generate full history summary for doctor ─────────────────────────
export function generatePatientSummary(recordsJson) {
  const prompt =
    [
      'You are a clinical AI assistant helping a doctor prepare for a patient appointment.',
      'Based on the last 6 months of records provided below, give:',
      '1. A 3-sentence overall health summary',
      '2. Key trends: which vitals are improving, stable, or worsening',
      '3. Any anomalies that should be discussed',
      '4. Suggested follow-up tests or actions',
      '',
      'Return ONLY valid JSON:',
      '{',
      '  "overallSummary": "...",',
      '  "trends": [{"vital": "Glucose", "direction": "IMPROVING", "detail": "..."}],',
      '  "anomalies": ["..."],',
      '  "suggestions": ["..."]',
      '}',
      '',
      'Patient records JSON:',
      '',
    ].join('\n') + recordsJson;

  return callGroq(prompt);
}

// ── AI Chat — contextual response using patient records ──────────────
export function chat(userMessage, patientRecordsContext) {
  const prompt = [
    "You are MediSage AI, a personal health assistant. Answer the user's question",
    'based ONLY on their medical records provided below.',
    'Be friendly, clear, and avoid technical jargon.',
    'If the answer is not in the records, say so honestly.',
    '',
    "Patient's records context:",
    patientRecordsContext,
    '',
    `User question: ${userMessage}`,
    '',
  ].join('\n');

  return callGroq(prompt);
}

// ── Shared builder for the JSON-returning prompts below ──────────────
function structuredPrompt(intro, shape, label, data) {
  return [
    ...intro,
    '',
    'Return ONLY valid JSON in this exact format, no explanation:',
    '{',
    ...shape,
    '}',
    '',
    label,
    '',
    data,
  ].join('\n');
}

// ── Symptom triage ───────────────────────────────────────────────────
export function analyzeSymptoms(symptoms, patientContext) {
  const prompt = structuredPrompt(
    [
      'You are a careful medical triage AI. A patient describes their symptoms below.',
      "Assess urgency conservatively and base your answer on the patient's own records where relevant.",
      'Never diagnose with certainty and never prescribe specific drug doses.',
      'If the description suggests an emergency (chest pain, stroke signs, breathing difficulty,',
      'severe bleeding, fainting, suicidal thoughts), urgency MUST be EMERGENCY.',
    ],
    [
      '  "urgency": "EMERGENCY",',
      '  "headline": "One sentence telling the patient what to do next.",',
      '  "possibleConditions": [{"name": "Condition", "likelihood": "HIGH", "reason": "Why this fits the symptoms"}],',
      '  "redFlags": ["Symptom that would make this an emergency"],',
      '  "advice": ["Concrete next step"],',
      '  "relatedFindings": ["Relevant value or diagnosis from the patient records below"],',
      '  "questionsForDoctor": ["Question worth asking at the appointment"],',
      '  "disclaimer": "Short reminder that this is not a diagnosis."',
    ],
    'urgency must be exactly one of: EMERGENCY, URGENT, ROUTINE, SELF_CARE. likelihood is HIGH, MEDIUM or LOW.',
    `Patient records context:\n${patientContext || 'No records available.'}\n\nSymptoms described by the patient:\n${symptoms}`,
  );

  return callGroq(prompt);
}

// ── Medication safety review across every report ─────────────────────
export function analyzeMedications(patientContext) {
  const prompt = structuredPrompt(
    [
      'You are a clinical pharmacist AI. Below are the medications and diagnoses extracted from all',
      "of one patient's reports. Review them for safety problems.",
      'Only report interactions you are confident about, and note that a doctor must confirm them.',
    ],
    [
      '  "summary": "2-3 sentence overview of medication safety.",',
      '  "medications": [{"name": "Metformin", "dosage": "500mg", "frequency": "twice daily", "purpose": "Blood sugar control", "reports": ["BLOOD_TEST"]}],',
      '  "duplicates": [{"name": "Metformin", "detail": "Same drug listed in two reports with different dosages"}],',
      '  "interactions": [{"between": ["Drug A", "Drug B"], "severity": "HIGH", "detail": "What may happen and what to do"}],',
      '  "allergyConflicts": ["Medication that conflicts with a known allergy"],',
      '  "warnings": ["Anything else the patient should raise with a doctor"]',
    ],
    'severity is HIGH, MEDIUM or LOW.',
    `Patient data (records JSON, one per line):\n${patientContext}`,
  );

  return callGroq(prompt);
}

// ── Personalised care plan ───────────────────────────────────────────
export function generateCarePlan(patientContext) {
  const prompt = structuredPrompt(
    [
      'You are a preventive-care AI. Build a practical, safe 7-day care plan for this patient',
      'based only on the conditions, medications, anomalies and trends in their records.',
      'Keep every action realistic for a normal person at home, and avoid prescribing drugs.',
    ],
    [
      '  "overview": "3-4 sentences about what this plan targets and why.",',
      '  "goals": [{"goal": "Lower fasting glucose", "target": "Under 100 mg/dL", "timeframe": "8 weeks"}],',
      '  "diet": {"focus": ["..."], "include": ["Food to eat more of"], "avoid": ["Food to cut down"]},',
      '  "lifestyle": ["Exercise, sleep or habit change"],',
      '  "weeklyPlan": [{"day": "Monday", "focus": "Theme of the day", "actions": ["Specific action"]}],',
      '  "monitoring": ["What to measure and how often"],',
      '  "followUp": ["Test or appointment to schedule"],',
      '  "disclaimer": "Short reminder that a doctor should approve this plan."',
    ],
    'weeklyPlan must contain exactly 7 entries, Monday through Sunday.',
    `Patient data:\n${patientContext}`,
  );

  return callGroq(prompt);
}

// ── Risk scoring ─────────────────────────────────────────────────────
export function scorePatientRisk(patientContext) {
  const prompt = structuredPrompt(
    [
      'You are a clinical risk scoring AI. Using the patient profile and vitals history below,',
      'estimate risk for the conditions that the data actually supports.',
      'Scores are 0-100 where 100 is the highest risk. Justify every score from the given values.',
      'Do not invent conditions that no data point suggests.',
    ],
    [
      '  "overallScore": 42,',
      '  "overallLevel": "MODERATE",',
      '  "explanation": "3-4 sentences explaining the overall score.",',
      '  "risks": [{"condition": "Type 2 Diabetes", "score": 70, "level": "HIGH", "factors": ["Fasting glucose 126 mg/dL on 2 reports"], "evidence": ["Glucose 126 mg/dL (2026-10-20)"]}],',
      '  "protectiveFactors": ["What is currently working in the patient favour"],',
      '  "recommendedActions": ["Concrete next step, most urgent first"]',
    ],
    'overallLevel and level are exactly one of: LOW, MODERATE, HIGH, CRITICAL. List at most 4 risks, dropped if no supporting data.',
    `Patient data:\n${patientContext}`,
  );

  return callGroq(prompt);
}

// ── Compare one report against the earlier ones ──────────────────────
export function compareReports(currentReport, previousReports) {
  const prompt = structuredPrompt(
    [
      'You are a medical AI comparing a patient\'s newest report against their previous reports.',
      'Focus on what actually changed for each value that appears in both.',
      'Values are clinically better when they move toward their normal range.',
    ],
    [
      '  "headline": "One sentence describing the biggest change.",',
      '  "narrative": "3-5 sentences comparing the current report with the previous ones.",',
      '  "changes": [{"vital": "Glucose", "previous": "110 mg/dL", "current": "126 mg/dL", "direction": "WORSE", "note": "Moved further above the 70-100 normal range"}],',
      '  "newAnomalies": ["Out-of-range value that was normal before"],',
      '  "resolvedAnomalies": ["Out-of-range value that is now normal"],',
      '  "persistingAnomalies": ["Out-of-range value that is still out of range"],',
      '  "medicationChanges": ["Medication added, stopped or re-dosed between the reports"],',
      '  "recommendedActions": ["What the patient or doctor should do next"]',
    ],
    'direction is exactly one of: BETTER, WORSE, STABLE, NEW. Only include vitals you can compare.',
    `Newest report:\n${currentReport}\n\nPrevious reports (oldest to newest):\n${previousReports}`,
  );

  return callGroq(prompt);
}

// ── Month-by-month analysis of the whole history ─────────────────────
export function analyzeMonthlyTrends(monthlyData) {
  const prompt = structuredPrompt(
    [
      'You are a longitudinal health AI. Below are all of a patient\'s reports grouped by month.',
      'Compare the months against each other and describe how the patient is actually trending.',
      'Be specific: quote the values and months that support each statement.',
    ],
    [
      '  "narrative": "4-6 sentences describing how this patient changed month by month.",',
      '  "monthSummaries": [{"month": "2026-08", "headline": "Short label for that month", "highlights": ["Notable value or event"], "anomalyCount": 2}],',
      '  "trends": [{"vital": "Glucose", "direction": "WORSENING", "monthlyValues": [{"month": "2026-08", "value": "110 mg/dL"}], "note": "Why this matters"}],',
      '  "watchlist": ["Value or symptom to keep an eye on"],',
      '  "improvements": ["What genuinely got better"],',
      '  "recommendedActions": ["Concrete next step"]'
    ],
    'direction is exactly one of: IMPROVING, WORSENING, STABLE, FLUCTUATING. Cover the months in the data, oldest first.',
    `Reports grouped by month:\n${monthlyData}`,
  );

  return callGroq(prompt);
}

// ── Admin: population-level insights across all patients ─────────────
export function populationInsights(cohortData) {
  const prompt = structuredPrompt(
    [
      'You are a public-health analytics AI for a clinic platform. Below is a summary of every',
      'registered patient and the values extracted from their reports.',
      'Find the patterns that matter to an administrator: which conditions and anomalies dominate,',
      'which patients look most at risk, and where the data itself is too thin to trust.',
      'Never invent patients that are not in the data.',
    ],
    [
      '  "overview": "4-5 sentences on the state of this patient population.",',
      '  "topAnomalies": [{"label": "High fasting glucose", "count": 3, "patients": 2, "insight": "Why this pattern matters"}],',
      '  "cohorts": [{"segment": "Patients with metabolic anomalies", "size": 2, "observation": "What characterises this group"}],',
      '  "patientsNeedingAttention": [{"name": "Patient name", "reason": "Why", "risk": "HIGH"}],',
      '  "dataQuality": ["Gaps or inconsistencies in the uploaded data"],',
      '  "recommendedActions": ["Operational next step for the clinic"]'
    ],
    'risk is HIGH, MEDIUM or LOW. Counts must match the data below.',
    `Population data:\n${cohortData}`,
  );

  return callGroq(prompt);
}

// ── Speech-to-text for the voice chat (Whisper, free tier) ───────────
export async function transcribeAudio(file) {
  try {
    const form = new FormData();
    form.append(
      'file',
      new Blob([file.buffer], { type: file.mimetype || 'audio/webm' }),
      file.originalname || 'recording.webm',
    );
    form.append('model', env.groqWhisperModel);
    form.append('response_format', 'json');

    const response = await fetch(env.groqAudioUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.groqApiKey}` },
      body: form,
      signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Groq transcription responded with HTTP ${response.status}`);

    const body = await response.json();
    return String(body.text ?? '').trim();
  } catch (err) {
    console.error(`Groq transcription failed: ${err.message}`);
    return '';
  }
}

// ── Core Groq API call ────────────────────────────────────────────────
async function callGroq(prompt) {
  try {
    const response = await fetch(env.groqApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: env.groqModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Groq responded with HTTP ${response.status}`);

    const body = await response.json();
    const raw = body.choices[0].message.content;
    if (raw === null || raw === undefined) throw new Error('Empty AI response');

    let content = String(raw).trim();
    if (content.startsWith('```json')) content = content.substring(7);
    else if (content.startsWith('```')) content = content.substring(3);
    if (content.endsWith('```')) content = content.substring(0, content.length - 3);

    return content.trim();
  } catch (err) {
    console.error(`Groq API call failed: ${err.message}`);
    return AI_UNAVAILABLE;
  }
}
