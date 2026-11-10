# MediSage AI — MERN Edition 🧬

Same product, same features, same API contract as the Spring Boot version — now on
**MongoDB · Express · React · Node.js**.

| Layer | Before | Now |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind | **unchanged** (2 tiny fixes, see below) |
| Backend | Java 21, Spring Boot 3, Spring Security | **Node 20+, Express 5** |
| Database | PostgreSQL (JPA/Hibernate) | **MongoDB (Mongoose)** |
| Auth | JWT (jjwt) + BCrypt(12) | JWT (jsonwebtoken, HS256, 24h) + BCrypt(12) |
| PDF text | Apache PDFBox | pdf-parse |
| AI | Groq `llama-3.1-8b-instant` | same model, **same prompts** |

## Quick start

Prerequisites: Node 20+, MongoDB (local or [Atlas](https://www.mongodb.com/atlas)), a free [Groq key](https://console.groq.com/keys).

```bash
npm run install:all
cp backend/.env.example backend/.env     # set MONGODB_URI, JWT_SECRET, GROQ_API_KEY
npm run dev                              # API :8080  +  UI :5173 (proxied to the API)
```

Production (single process serves API **and** the built UI):
```bash
npm run build && NODE_ENV=production npm start      # or: docker build -t medisage .
```
Tests (need a reachable MongoDB; a throw-away database is created and dropped; Groq is stubbed):
```bash
MONGODB_URI=mongodb://127.0.0.1:27017 npm test
```
Try the upload feature with the PDFs in `sample-reports/`.

## Project layout
```
backend/src
  config/      env + db            (application.properties)
  models/      7 Mongoose schemas  (User, Patient, Doctor, MedicalRecord, AiSummary, ChatHistory, AuditLog)
  services/    auth, patient, doctor, admin, ai, audit, file   (1:1 with the Java services)
  controllers/ routes/ middleware/  (Controllers, SecurityConfig, JwtAuthFilter, GlobalExceptionHandler)
  utils/       serializers, validators, jwt, dates
frontend/      React app
```

## API (unchanged paths, bodies and `{success,message,data}` envelope)
`POST /api/auth/register|login` · `GET /api/public/ping` · `GET /api/files/:name`
`GET /api/patient/records|summary|profile|chat/history` · `POST /api/patient/upload-record|chat`
`GET /api/doctor/patients|profile|patient/:id/records|patient/:id/summary`
`GET /api/admin/users|doctors|patients|audit-logs` · `PUT /api/admin/assign-doctor|deactivate/:userId`

Access rules are identical: `/admin` ADMIN · `/doctor` DOCTOR+ADMIN · `/patient` any role · auth/files/public open.

## What necessarily changed
* **IDs** are MongoDB ObjectId strings instead of numeric `Long`s (the UI already treats ids as strings).
* **Dates**: timestamps are ISO-8601 with `Z`; `visitDate`/`dateOfBirth` remain plain `YYYY-MM-DD`.
* **Registration** has no multi-document transaction on standalone MongoDB; partial writes are rolled back manually.

## Fixes so the UI really works (additive, no business-logic change)
The Java service returned raw JPA entities, which (a) included the BCrypt password hash, (b) recursed infinitely
for `Patient → Doctor → patients → Patient…`, and (c) lacked fields the React screens read. Responses now keep every
original field **plus** `name`, `email`, `dob`, `createdAt`, `targetId` aliases, and never include `password`.
Also, the admin screens called `GET /admin/audit` and `POST /admin/assign-patient?patientId=&doctorId=`, which the Java
backend never exposed — both are now served (the original `/audit-logs` and `PUT /assign-doctor` still work).
Frontend edits: `lib/api.ts` default base URL is now `/api`; `PatientDetail.tsx` handles the comma-separated `allergies` string.
Unauthenticated / expired-token requests now get **401** (Spring returned 403), so the UI's existing 401 → login redirect works.

## Original behaviour deliberately preserved — consider hardening
* `active=false` ("deactivate") is stored but **not enforced at login**, as before.
* Any DOCTOR can read **any** patient's records/summary (no assignment check), as before.
* `/api/files/**` is public (files are protected only by an unguessable UUID prefix), as before.
* `role: "ADMIN"` is accepted on self-registration (it is how the first admin is created), as before.
