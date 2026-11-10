// Port of spring.servlet.multipart.* (10MB cap). Files are kept in memory because FileService
// both writes them to disk and parses PDFs from the same buffer.
import multer from 'multer';
import { env } from '../config/env.js';

export const uploadSingleFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSize, files: 1 },
  defParamCharset: 'utf8', // keep non-ASCII file names intact
}).single('file');

// Voice chat recordings (browser MediaRecorder -> webm/ogg/mp4). Never written to disk.
export const uploadAudioFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSize, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype?.startsWith('audio/') ?? false),
}).single('audio');
