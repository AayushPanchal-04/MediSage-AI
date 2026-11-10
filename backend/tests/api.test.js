// End-to-end API tests: real Express app + real MongoDB + a stub standing in for the Groq API.
//   MONGODB_URI=mongodb://127.0.0.1:27017 npm test      (a throw-away database is created & dropped)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dbName = `medisage_test_${Date.now()}`;
const testMongoUri = (() => {
  const u = new URL(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
  u.pathname = `/${dbName}`; // always a throw-away database, never the real one
  return u.toString();
})();

// ── Stub Groq server ────────────────────────────────────────────────────
const groq = { prompts: [], fail: false };
const EXTRACTION = {
  summary: 'Your blood pressure is high. Please follow up with your doctor.',
  vitals: [{ name: 'Glucose', value: '110', unit: 'mg/dL', normalRange: '70-100', status: 'ANOMALY' }],
  diagnosis: ['Hypertension'],
  medications: [],
  doctorName: 'Dr. Mehta',
  reportDate: '2026-01-15',
  anomalies: ['Blood Pressure: 145/92'],
};
const groqServer = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    const body = JSON.parse(raw);
    const prompt = body.messages[0].content;
    groq.prompts.push({ prompt, body, auth: req.headers.authorization });
    if (groq.fail) {
      res.writeHead(500).end('boom');
      return;
    }
    let content;
    if (prompt.includes('medical data extraction AI')) content = '```json\n' + JSON.stringify(EXTRACTION) + '\n```';
    else if (prompt.includes('clinical AI assistant')) content = '{"overallSummary":"ok","trends":[],"anomalies":[],"suggestions":[]}';
    else content = 'Your glucose is slightly high.';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ choices: [{ message: { content } }] }));
  });
});

let server, base, mongoose;
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'medisage-uploads-'));

before(async () => {
  await new Promise((r) => groqServer.listen(0, '127.0.0.1', r));
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = testMongoUri;
  process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
  process.env.GROQ_API_KEY = 'test-key';
  process.env.GROQ_API_URL = `http://127.0.0.1:${groqServer.address().port}/v1/chat/completions`;
  process.env.UPLOAD_DIR = uploadDir;
  process.env.CLIENT_DIST = path.join(os.tmpdir(), 'no-such-dist');

  const { connectDB } = await import('../src/config/db.js');
  const { createApp } = await import('../src/app.js');
  mongoose = (await import('mongoose')).default;
  await connectDB();
  await mongoose.connection.syncIndexes?.().catch(() => {});
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((r) => server.close(r));
  await new Promise((r) => groqServer.close(r));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  fs.rmSync(uploadDir, { recursive: true, force: true });
});

// ── helpers ─────────────────────────────────────────────────────────────
async function call(method, url, { token, json, form, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(json);
  }
  if (form) opts.body = form;
  const res = await fetch(base + url, opts);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body, headers: res.headers, text };
}
const reportForm = (extra = {}, file) => {
  const f = new FormData();
  f.append('file', file ?? new Blob([fs.readFileSync(path.join(here, 'fixtures/report.pdf'))], { type: 'application/pdf' }), 'Jan Report.pdf');
  f.append('reportType', 'BLOOD_TEST');
  for (const [k, v] of Object.entries(extra)) f.append(k, v);
  return f;
};

const ctx = {}; // shared state across ordered tests

// ── public / auth ───────────────────────────────────────────────────────
test('GET /api/public/ping', async () => {
  const r = await call('GET', '/api/public/ping');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { success: true, message: 'Server is alive', data: { status: 'UP' } });
});

test('register: validation messages match the Java DTO annotations', async () => {
  let r = await call('POST', '/api/auth/register', { json: { fullName: '', email: 'nope', password: 'short' } });
  assert.equal(r.status, 400);
  assert.equal(r.body.success, false);
  assert.equal(r.body.data, null);
  assert.match(r.body.message, /fullName: must not be blank/);
  assert.match(r.body.message, /email: must be a well-formed email address/);
  assert.match(r.body.message, /password: Password must be at least 8 characters/);

  r = await call('POST', '/api/auth/register', { json: { fullName: 'A', email: 'a@b.com', password: 'password123', role: 'SUPERUSER' } });
  assert.equal(r.status, 400);

  r = await call('POST', '/api/auth/register', { headers: { 'Content-Type': 'application/json' }, form: '{bad json' });
  assert.equal(r.status, 400);
});

test('register patient (empty dateOfBirth like the UI form sends), doctor, admin', async () => {
  let r = await call('POST', '/api/auth/register', {
    json: { fullName: 'John Patient', email: 'john@example.com', password: 'password123', role: 'PATIENT', dateOfBirth: '1995-06-15', bloodGroup: 'O+', allergies: 'Penicillin,Dust' },
  });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.body.message, 'Registration successful');
  const d = r.body.data;
  assert.deepEqual(Object.keys(d).sort(), ['email', 'fullName', 'profileId', 'role', 'token']);
  assert.equal(d.role, 'PATIENT');
  assert.match(d.profileId, /^[0-9a-f]{24}$/);
  ctx.patient = d;

  r = await call('POST', '/api/auth/register', { json: { fullName: 'Empty Dob', email: 'empty@example.com', password: 'password123', role: 'PATIENT', dateOfBirth: '', bloodGroup: '', allergies: '' } });
  assert.equal(r.status, 200, r.text);

  r = await call('POST', '/api/auth/register', { json: { fullName: 'Dr. Sarah Smith', email: 'doctor@example.com', password: 'password123', role: 'DOCTOR', specialization: 'Cardiology', licenseNumber: 'L1', hospitalAffiliation: 'City' } });
  assert.equal(r.status, 200, r.text);
  ctx.doctor = r.body.data;

  r = await call('POST', '/api/auth/register', { json: { fullName: 'Admin User', email: 'admin@example.com', password: 'admin12345', role: 'ADMIN' } });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.body.data.profileId, null);
  ctx.admin = r.body.data;

  // role omitted => PATIENT
  r = await call('POST', '/api/auth/register', { json: { fullName: 'Default Role', email: 'default@example.com', password: 'password123' } });
  assert.equal(r.body.data.role, 'PATIENT');
});

test('register: duplicate email -> 400 "Email already registered"', async () => {
  const r = await call('POST', '/api/auth/register', { json: { fullName: 'X', email: 'john@example.com', password: 'password123' } });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, 'Email already registered');
});

test('login: success returns token + profileId; bad credentials -> 401', async () => {
  let r = await call('POST', '/api/auth/login', { json: { email: 'john@example.com', password: 'password123' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.message, 'Login successful');
  assert.equal(r.body.data.profileId, ctx.patient.profileId);
  ctx.patient.token = r.body.data.token;
  assert.equal(r.text.includes('$2'), false, 'must not leak bcrypt hash');

  r = await call('POST', '/api/auth/login', { json: { email: 'john@example.com', password: 'wrong-password' } });
  assert.equal(r.status, 401);
  assert.equal(r.body.message, 'Invalid email or password');

  r = await call('POST', '/api/auth/login', { json: { email: 'ghost@example.com', password: 'password123' } });
  assert.equal(r.status, 401);

  r = await call('POST', '/api/auth/login', { json: { email: '', password: '' } });
  assert.equal(r.status, 400);

  ctx.doctor.token = (await call('POST', '/api/auth/login', { json: { email: 'doctor@example.com', password: 'password123' } })).body.data.token;
  ctx.admin.token = (await call('POST', '/api/auth/login', { json: { email: 'admin@example.com', password: 'admin12345' } })).body.data.token;
});

test('JWT claims: subject=email, role claim, ~24h expiry', async () => {
  const payload = JSON.parse(Buffer.from(ctx.patient.token.split('.')[1], 'base64url').toString());
  assert.equal(payload.sub, 'john@example.com');
  assert.equal(payload.role, 'PATIENT');
  assert.equal(payload.exp - payload.iat, 86400);
});

// ── access control (SecurityConfig) ─────────────────────────────────────
test('access rules: unauthenticated -> 401, wrong role -> 403, public stays open', async () => {
  assert.equal((await call('GET', '/api/patient/records')).status, 401);
  assert.equal((await call('GET', '/api/patient/records', { token: 'garbage.token.here' })).status, 401);
  assert.equal((await call('GET', '/api/admin/users', { token: ctx.patient.token })).status, 403);
  assert.equal((await call('GET', '/api/doctor/patients', { token: ctx.patient.token })).status, 403);
  assert.equal((await call('GET', '/api/admin/users', { token: ctx.doctor.token })).status, 403);
  assert.equal((await call('GET', '/api/files/nothing.pdf')).status, 404); // permitAll: reaches the controller
  const forbidden = await call('GET', '/api/admin/users', { token: ctx.patient.token });
  assert.equal(forbidden.body.message, 'Access denied');
});

// ── patient flows ───────────────────────────────────────────────────────
test('patient: empty history -> "No records found" message and empty list', async () => {
  let r = await call('GET', '/api/patient/records', { token: ctx.patient.token });
  assert.deepEqual(r.body.data, []);
  r = await call('GET', '/api/patient/summary', { token: ctx.patient.token });
  assert.equal(r.body.data, '{"message": "No records found"}');
  assert.equal(groq.prompts.length, 0, 'no AI call when there are no records');
});

test('patient: upload PDF -> extracted via AI, status WARNING, file stored & served', async () => {
  groq.prompts.length = 0;
  const r = await call('POST', '/api/patient/upload-record', { token: ctx.patient.token, form: reportForm({ visitDate: '2026-01-15', reportName: 'January Metabolic' }) });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.body.message, 'Record uploaded and analysed');
  const rec = r.body.data;
  assert.equal(rec.reportType, 'BLOOD_TEST');
  assert.equal(rec.reportName, 'January Metabolic');
  assert.equal(rec.visitDate, '2026-01-15');
  assert.equal(rec.originalFileName, 'Jan Report.pdf');
  assert.equal(rec.status, 'WARNING'); // response contains "ANOMALY"
  assert.match(rec.fileUrl, /^[0-9a-f-]{36}_Jan Report\.pdf$/);
  assert.equal(typeof rec.extractedData, 'string');
  const parsed = JSON.parse(rec.extractedData); // fences were stripped
  assert.equal(parsed.vitals[0].name, 'Glucose');
  for (const hidden of ['patient', 'doctor', 'aiSummary']) assert.equal(hidden in rec, false);
  ctx.record = rec;

  // prompt: exact header + extracted PDF text, no page markers
  const { prompt, body, auth } = groq.prompts[0];
  assert.ok(prompt.startsWith('You are a medical data extraction AI. From the report text below, extract:\n1. Patient vitals'));
  assert.ok(prompt.includes('Report text:\nCITY GENERAL HOSPITAL - CLINICAL REPORT'));
  assert.ok(!/-- \d+ of \d+ --/.test(prompt));
  assert.equal(body.model, 'llama-3.1-8b-instant');
  assert.equal(body.temperature, 0.2);
  assert.equal(auth, 'Bearer test-key');

  // file served with correct content type, byte-identical
  const f = await call('GET', `/api/files/${encodeURIComponent(rec.fileUrl)}`, { token: ctx.patient.token });
  assert.equal(f.status, 200);
  assert.equal(f.headers.get('content-type'), 'application/pdf');
  assert.equal(f.text.startsWith('%PDF'), true);

  // AiSummary persisted with the original's rules
  const { AiSummary } = await import('../src/models/index.js');
  const s = await AiSummary.findOne({ record: rec.id });
  assert.equal(s.summaryText, EXTRACTION.summary);
  assert.equal(s.confidenceScore, 0.92);
  assert.equal(JSON.parse(s.anomalies).doctorName, 'Dr. Mehta');
});

test('patient: upload validation (type, empty, missing file, bad date)', async () => {
  let r = await call('POST', '/api/patient/upload-record', { token: ctx.patient.token, form: reportForm({}, new Blob(['hello'], { type: 'text/plain' })) });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, 'Only PDF and image files are allowed');

  r = await call('POST', '/api/patient/upload-record', { token: ctx.patient.token, form: reportForm({}, new Blob([], { type: 'application/pdf' })) });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, 'File is empty');

  const noFile = new FormData();
  noFile.append('reportType', 'BLOOD_TEST');
  r = await call('POST', '/api/patient/upload-record', { token: ctx.patient.token, form: noFile });
  assert.equal(r.status, 400);

  r = await call('POST', '/api/patient/upload-record', { token: ctx.patient.token, form: reportForm({ visitDate: '15/01/2026' }) });
  assert.equal(r.status, 400);

  r = await call('POST', '/api/patient/upload-record', { token: ctx.patient.token, form: reportForm({}, new Blob(['%PDF-1.4 not really a pdf'], { type: 'application/pdf' })) });
  assert.equal(r.status, 400, 'corrupt PDF is a client error');
  assert.equal(fs.readdirSync(uploadDir).length, 1, 'no orphan files left behind by failed uploads');
});

test('patient: image upload uses the placeholder text; default visit date = today; reportName defaults to file name', async () => {
  groq.prompts.length = 0;
  const f = new FormData();
  f.append('file', new Blob([Buffer.from([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' }), 'scan.png');
  f.append('reportType', 'SCAN');
  const r = await call('POST', '/api/patient/upload-record', { token: ctx.patient.token, form: f });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.body.data.reportName, 'scan.png');
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  assert.equal(r.body.data.visitDate, today);
  assert.ok(groq.prompts[0].prompt.endsWith('Report text:\nImage file — text extraction requires Vision API'));
  const img = await call('GET', `/api/files/${r.body.data.fileUrl}`);
  assert.equal(img.headers.get('content-type'), 'image/png');
});

test('patient: records listed newest first; extractedData stays a JSON string', async () => {
  const r = await call('GET', '/api/patient/records', { token: ctx.patient.token });
  assert.equal(r.status, 200);
  assert.equal(r.body.data.length, 2);
  assert.equal(r.body.data[0].reportName, 'scan.png');
  assert.equal(r.body.data[1].reportName, 'January Metabolic');
  assert.equal(typeof r.body.data[1].extractedData, 'string');
});

test('patient: AI summary + chat (prompt context, history order, graceful AI failure)', async () => {
  groq.prompts.length = 0;
  let r = await call('GET', '/api/patient/summary', { token: ctx.patient.token });
  assert.equal(r.status, 200);
  assert.equal(r.body.message, 'Summary generated');
  assert.equal(typeof r.body.data, 'string');
  assert.equal(JSON.parse(r.body.data).overallSummary, 'ok');
  assert.ok(groq.prompts[0].prompt.startsWith('You are a clinical AI assistant helping a doctor prepare'));

  groq.prompts.length = 0;
  r = await call('POST', '/api/patient/chat', { token: ctx.patient.token, json: { message: 'Is my glucose normal?' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.message, 'AI response');
  assert.equal(r.body.data.aiResponse, 'Your glucose is slightly high.');
  assert.equal(r.body.data.userMessage, 'Is my glucose normal?');
  assert.equal(r.body.data.user.email, 'john@example.com');
  assert.equal('password' in r.body.data.user, false);
  const p = groq.prompts[0].prompt;
  assert.ok(p.startsWith("You are MediSage AI, a personal health assistant. Answer the user's question\nbased ONLY on their medical records provided below."));
  assert.ok(p.includes("\n\nPatient's records context:\n"));
  assert.ok(p.endsWith('\n\nUser question: Is my glucose normal?\n'));
  assert.ok(p.includes('"Glucose"'), 'records context is injected');

  groq.fail = true; // AI outage -> same fallback payload as the Java version, still saved
  r = await call('POST', '/api/patient/chat', { token: ctx.patient.token, json: { message: 'Still there?' } });
  groq.fail = false;
  assert.equal(r.status, 200);
  assert.equal(r.body.data.aiResponse, '{"error": "AI service temporarily unavailable"}');

  r = await call('POST', '/api/patient/chat', { token: ctx.patient.token, json: { message: '   ' } });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, 'message: must not be blank');

  r = await call('GET', '/api/patient/chat/history', { token: ctx.patient.token });
  assert.deepEqual(r.body.data.map((h) => h.userMessage), ['Is my glucose normal?', 'Still there?']);
  assert.ok(r.body.data[0].timestamp);
});

test('patient: upload while AI is down still stores the record (status NORMAL)', async () => {
  groq.fail = true;
  const r = await call('POST', '/api/patient/upload-record', { token: ctx.patient.token, form: reportForm({ reportName: 'AI down' }) });
  groq.fail = false;
  assert.equal(r.status, 200, r.text);
  assert.equal(r.body.data.status, 'NORMAL');
  assert.equal(r.body.data.extractedData, '{"error": "AI service temporarily unavailable"}');
});

test('patient: profile has UI-compatible fields and no password hash', async () => {
  const r = await call('GET', '/api/patient/profile', { token: ctx.patient.token });
  assert.equal(r.status, 200);
  const p = r.body.data;
  assert.equal(p.id, ctx.patient.profileId);
  assert.equal(p.bloodGroup, 'O+');
  assert.equal(p.allergies, 'Penicillin,Dust');
  assert.equal(p.dateOfBirth, '1995-06-15');
  assert.equal(p.dob, '1995-06-15');
  assert.equal(p.name, 'John Patient');
  assert.equal(p.assignedDoctor, null);
  assert.equal(r.text.includes('password'), false);
  // non-patient callers have no patient profile -> 404, same as Java
  assert.equal((await call('GET', '/api/patient/profile', { token: ctx.admin.token })).status, 404);
});

// ── admin + doctor flows ────────────────────────────────────────────────
test('admin: users / doctors / patients lists (aliases for the UI, no secrets)', async () => {
  let r = await call('GET', '/api/admin/users', { token: ctx.admin.token });
  assert.equal(r.status, 200);
  assert.equal(r.body.data.length, 5);
  assert.ok(r.body.data.every((u) => u.name === u.fullName && u.active === true && !('password' in u)));
  assert.equal(r.text.includes('$2'), false);

  r = await call('GET', '/api/admin/doctors', { token: ctx.admin.token });
  assert.equal(r.body.data.length, 1);
  assert.equal(r.body.data[0].name, 'Dr. Sarah Smith');
  assert.equal(r.body.data[0].specialization, 'Cardiology');
  ctx.doctorProfileId = r.body.data[0].id;
  assert.equal(ctx.doctorProfileId, ctx.doctor.profileId);

  r = await call('GET', '/api/admin/patients', { token: ctx.admin.token });
  assert.equal(r.body.data.length, 3);
  assert.ok(r.body.data.every((p) => p.assignedDoctor === null));
});

test('admin: assign doctor (original PUT body form AND the POST query form the UI uses)', async () => {
  let r = await call('PUT', '/api/admin/assign-doctor', { token: ctx.admin.token, json: { patientId: ctx.patient.profileId, doctorId: ctx.doctorProfileId } });
  assert.equal(r.status, 200, r.text);
  assert.deepEqual(r.body, { success: true, message: 'Doctor assigned successfully', data: null });

  const empty = (await call('GET', '/api/admin/patients', { token: ctx.admin.token })).body.data.find((p) => p.email === 'empty@example.com');
  r = await call('POST', `/api/admin/assign-patient?patientId=${empty.id}&doctorId=${ctx.doctorProfileId}`, { token: ctx.admin.token });
  assert.equal(r.status, 200, r.text);

  r = await call('GET', '/api/admin/patients', { token: ctx.admin.token });
  const john = r.body.data.find((p) => p.email === 'john@example.com');
  assert.equal(john.assignedDoctor.id, ctx.doctorProfileId);
  assert.equal(john.assignedDoctor.name, 'Dr. Sarah Smith'); // the AdminAssign screen reads this
  assert.equal(r.body.data.filter((p) => p.assignedDoctor).length, 2);

  r = await call('PUT', '/api/admin/assign-doctor', { token: ctx.admin.token, json: { patientId: '000000000000000000000000', doctorId: ctx.doctorProfileId } });
  assert.equal(r.status, 404);
  assert.equal(r.body.message, 'Patient not found');
  r = await call('PUT', '/api/admin/assign-doctor', { token: ctx.admin.token, json: { patientId: ctx.patient.profileId, doctorId: 'not-an-id' } });
  assert.equal(r.status, 404);
  assert.equal(r.body.message, 'Doctor not found');
});

test('doctor: my patients (no recursion), profile, records, AI summary', async () => {
  let r = await call('GET', '/api/doctor/patients', { token: ctx.doctor.token });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.body.data.length, 2);
  const john = r.body.data.find((p) => p.name === 'John Patient');
  assert.equal(john.dob, '1995-06-15');
  assert.equal(john.id, ctx.patient.profileId);

  r = await call('GET', '/api/doctor/profile', { token: ctx.doctor.token });
  assert.equal(r.body.data.specialization, 'Cardiology');
  assert.equal(r.body.data.user.email, 'doctor@example.com');

  r = await call('GET', `/api/doctor/patient/${ctx.patient.profileId}/records`, { token: ctx.doctor.token });
  assert.equal(r.status, 200);
  assert.equal(r.body.data.length, 3);

  groq.prompts.length = 0;
  r = await call('GET', `/api/doctor/patient/${ctx.patient.profileId}/summary`, { token: ctx.doctor.token });
  assert.equal(r.status, 200);
  assert.equal(JSON.parse(r.body.data).overallSummary, 'ok');
  assert.equal(groq.prompts.length, 1);

  const emptyId = (await call('GET', '/api/doctor/patients', { token: ctx.doctor.token })).body.data.find((p) => p.email === 'empty@example.com').id;
  r = await call('GET', `/api/doctor/patient/${emptyId}/summary`, { token: ctx.doctor.token });
  assert.equal(r.body.data, '{"message": "No records available"}');

  r = await call('GET', '/api/doctor/patient/ffffffffffffffffffffffff/records', { token: ctx.doctor.token });
  assert.equal(r.status, 404);
  assert.equal(r.body.message, 'Patient not found');

  // ADMIN passes the role gate but has no doctor profile -> 404, exactly like the Java service
  r = await call('GET', '/api/doctor/patients', { token: ctx.admin.token });
  assert.equal(r.status, 404);
  assert.equal(r.body.message, 'Doctor profile not found');
});

test('admin: audit log records every action, newest first, with UI aliases', async () => {
  const r = await call('GET', '/api/admin/audit-logs', { token: ctx.admin.token });
  assert.equal(r.status, 200);
  const logs = r.body.data;
  const actions = new Set(logs.map((l) => l.action));
  for (const a of ['LOGIN', 'VIEW', 'UPLOAD', 'GENERATE_SUMMARY']) assert.ok(actions.has(a), `missing ${a}`);
  assert.ok(logs.some((l) => l.details === 'User registered'));
  assert.ok(logs.some((l) => l.details === 'Viewed all records' && l.targetRecordId === null));
  assert.ok(logs.some((l) => l.details === 'Doctor viewed patient records' && l.targetRecordId === ctx.patient.profileId));
  assert.ok(logs.some((l) => l.details === 'Uploaded BLOOD_TEST' && l.targetRecordId === ctx.record.id));
  assert.ok(logs.some((l) => l.details === `Generated AI summary for patient ${ctx.patient.profileId}`));
  for (let i = 1; i < logs.length; i++) assert.ok(new Date(logs[i - 1].timestamp) >= new Date(logs[i].timestamp));
  const l = logs[0];
  assert.equal(l.createdAt, l.timestamp);
  assert.equal(l.targetId, l.targetRecordId);
  assert.ok(l.user.name && l.user.role && l.user.email);

  const alias = await call('GET', '/api/admin/audit', { token: ctx.admin.token });
  assert.equal(alias.body.data.length, logs.length);
});

test('admin: deactivate user', async () => {
  const users = (await call('GET', '/api/admin/users', { token: ctx.admin.token })).body.data;
  const target = users.find((u) => u.email === 'default@example.com');
  let r = await call('PUT', `/api/admin/deactivate/${target.id}`, { token: ctx.admin.token });
  assert.deepEqual(r.body, { success: true, message: 'User deactivated', data: null });
  r = await call('GET', '/api/admin/users', { token: ctx.admin.token });
  assert.equal(r.body.data.find((u) => u.id === target.id).active, false);
  r = await call('PUT', '/api/admin/deactivate/zzz', { token: ctx.admin.token });
  assert.equal(r.status, 404);
  assert.equal(r.body.message, 'User not found');
});

test('files: path traversal is rejected; unknown API route is a JSON 404', async () => {
  const r = await call('GET', '/api/files/..%2F..%2Fpackage.json');
  assert.ok([400, 404].includes(r.status));
  assert.notEqual(r.status, 200);
  const nf = await call('GET', '/api/nope');
  assert.equal(nf.status, 404);
  assert.equal(nf.body.success, false);
});

test('CORS: allowed origin gets headers with credentials, unknown origin does not', async () => {
  let r = await call('GET', '/api/public/ping', { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(r.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal(r.headers.get('access-control-allow-credentials'), 'true');
  r = await call('GET', '/api/public/ping', { headers: { Origin: 'https://evil.example' } });
  assert.equal(r.headers.get('access-control-allow-origin'), null);
  r = await call('OPTIONS', '/api/patient/chat', { headers: { Origin: 'https://medsageai.vercel.app', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' } });
  assert.equal(r.status, 204);
});
