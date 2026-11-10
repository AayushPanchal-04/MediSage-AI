// URL + access rules ported 1:1 from SecurityConfig.authorizeHttpRequests and the @RequestMapping classes.
import { Router } from 'express';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { requireRoles } from '../middleware/auth.js';
import { uploadSingleFile, uploadAudioFile } from '../middleware/upload.js';
import { Role } from '../models/enums.js';
import * as auth from '../controllers/auth.controller.js';
import * as patient from '../controllers/patient.controller.js';
import * as doctor from '../controllers/doctor.controller.js';
import * as admin from '../controllers/admin.controller.js';
import * as files from '../controllers/file.controller.js';
import * as pub from '../controllers/public.controller.js';
import * as insight from '../controllers/insight.controller.js';

// /api/public/**  (permitAll)
export const publicRouter = Router();
publicRouter.get('/ping', pub.ping);

// /api/auth/**  (permitAll)
export const authRouter = Router();
authRouter.post('/register', h(auth.register));
authRouter.post('/login', h(auth.login));

// /api/files/**  (permitAll)
export const fileRouter = Router();
fileRouter.get('/:filename', files.getFile);

// /api/patient/**  -> PATIENT, DOCTOR, ADMIN
export const patientRouter = Router();
patientRouter.use(requireRoles(Role.PATIENT, Role.DOCTOR, Role.ADMIN));
patientRouter.get('/records', h(patient.getRecords));
patientRouter.post('/upload-record', uploadSingleFile, h(patient.uploadRecord));
patientRouter.get('/summary', h(patient.getSummary));
patientRouter.post('/chat', h(patient.chat));
patientRouter.get('/chat/history', h(patient.getChatHistory));
patientRouter.get('/profile', h(patient.getProfile));

// AI insight features (all cached in AiInsight, ?refresh=true to regenerate)
patientRouter.post('/triage', h(insight.symptomTriage));
patientRouter.get('/medications', h(insight.medicationSafety));
patientRouter.get('/care-plan', h(insight.carePlan));
patientRouter.get('/risk', h(insight.myRisk));
patientRouter.get('/trends/monthly', h(insight.monthlyTrends));
patientRouter.get('/records/:id/compare', h(insight.compareRecord));
patientRouter.post('/chat/voice', uploadAudioFile, h(insight.transcribe));

// /api/doctor/**  -> DOCTOR, ADMIN
export const doctorRouter = Router();
doctorRouter.use(requireRoles(Role.DOCTOR, Role.ADMIN));
doctorRouter.get('/patients', h(doctor.getMyPatients));
doctorRouter.get('/patient/:id/records', h(doctor.getPatientRecords));
doctorRouter.get('/patient/:id/summary', h(doctor.getPatientSummary));
doctorRouter.get('/patient/:id/risk', h(insight.patientRisk));
doctorRouter.get('/profile', h(doctor.getProfile));

// /api/admin/**  -> ADMIN
export const adminRouter = Router();
adminRouter.use(requireRoles(Role.ADMIN));
adminRouter.get('/users', h(admin.getAllUsers));
adminRouter.get('/doctors', h(admin.getAllDoctors));
adminRouter.get('/patients', h(admin.getAllPatients));
adminRouter.put('/assign-doctor', h(admin.assignDoctor));
adminRouter.post('/assign-patient', h(admin.assignDoctor)); // path the React UI calls
adminRouter.put('/deactivate/:userId', h(admin.deactivate));
adminRouter.get('/audit-logs', h(admin.getAuditLogs));
adminRouter.get('/audit', h(admin.getAuditLogs)); // path the React UI calls
adminRouter.get('/insights', h(insight.population)); // AI population insights
