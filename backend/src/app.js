import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import {
  publicRouter,
  authRouter,
  fileRouter,
  patientRouter,
  doctorRouter,
  adminRouter,
} from './routes/index.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  // CorsConfig.java — same origins/methods, credentials on, only for /api/**
  const corsMiddleware = cors({
    origin(origin, callback) {
      // no Origin header = same-origin / curl / Postman
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.use(
    helmet({
      contentSecurityPolicy: false, // the SPA loads Google Fonts / remote images
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  if (process.env.NODE_ENV !== 'test') app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  // ── API ──────────────────────────────────────────────────────────────
  app.use('/api', corsMiddleware, express.json({ limit: '1mb' }), authenticate);

  app.use('/api/public', publicRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/files', fileRouter);
  app.use('/api/patient', patientRouter);
  app.use('/api/doctor', doctorRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', notFoundHandler);

  // ── Built React app (optional): one process serves UI + API ──────────
  const indexHtml = path.join(env.clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use(express.static(env.clientDist));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      return res.sendFile(indexHtml); // client-side routing fallback
    });
  }

  app.use(errorHandler);
  return app;
}
