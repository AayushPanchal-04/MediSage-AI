// Central configuration — mirrors the old application.properties.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const isProduction = process.env.NODE_ENV === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set in production');
  }
  jwtSecret = 'dev-only-insecure-secret-change-me-please-0123456789';
  console.warn('[config] JWT_SECRET not set — using an insecure development default.');
}

// Same allowed origins as the old CorsConfig, plus anything in CORS_ORIGINS (comma separated).
const defaultOrigins = [
  'http://localhost:5173', // Vite dev
  'http://localhost:3000', // CRA dev
  'https://medsageai.vercel.app',
  'http://medsageai.vercel.app',
];
const extraOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const env = {
  isProduction,
  backendRoot,
  port: Number(process.env.PORT) || 8080, // server.port=${PORT:8080}
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediai_db',

  jwtSecret,
  jwtExpirationMs: Number(process.env.JWT_EXPIRATION) || 86_400_000, // jwt.expiration=86400000

  groqApiKey: process.env.GROQ_API_KEY || 'REPLACE_WITH_YOUR_KEY',
  groqApiUrl: process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',

  // Speech-to-text for the voice chat (free tier on Groq).
  groqAudioUrl: process.env.GROQ_AUDIO_URL || 'https://api.groq.com/openai/v1/audio/transcriptions',
  groqWhisperModel: process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3-turbo',

  uploadDir: path.resolve(backendRoot, process.env.UPLOAD_DIR || 'uploads'),
  maxFileSize: 10 * 1024 * 1024, // 10MB, as before

  corsOrigins: [...new Set([...defaultOrigins, ...extraOrigins])],

  // Built React app (served by Express when present, so one deploy serves everything).
  clientDist: path.resolve(backendRoot, process.env.CLIENT_DIST || '../frontend/dist'),
};
