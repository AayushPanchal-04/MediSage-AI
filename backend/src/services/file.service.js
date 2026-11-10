// Port of service/FileService.java (local-disk storage + PDF text extraction).
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { PDFParse } from 'pdf-parse';
import { env } from '../config/env.js';
import { badRequest } from '../utils/errors.js';

export const isPdf = (file) => file.mimetype === 'application/pdf';
export const isImage = (file) => typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');

export function validateFile(file) {
  if (!file || file.size === 0) throw badRequest('File is empty');
  if (file.size > env.maxFileSize) throw badRequest('File exceeds 10MB limit');
  if (!isPdf(file) && !isImage(file)) throw badRequest('Only PDF and image files are allowed');
}

/** Saves as "<uuid>_<originalName>" and returns that stored file name. */
export async function saveFile(file) {
  await fs.mkdir(env.uploadDir, { recursive: true });
  const safeName = path.basename(file.originalname || 'file').replace(/[\\/\0]/g, '_');
  const fileName = `${randomUUID()}_${safeName}`;
  await fs.writeFile(path.join(env.uploadDir, fileName), file.buffer);
  return fileName;
}

export async function deleteFile(fileName) {
  await fs.rm(path.join(env.uploadDir, fileName), { force: true });
}

/** PDFBox PDFTextStripper equivalent. */
export async function extractTextFromPdf(file) {
  const parser = new PDFParse({ data: new Uint8Array(file.buffer) });
  try {
    // pageJoiner '' => plain text, without "-- 1 of 3 --" page markers
    const result = await parser.getText({ pageJoiner: '' });
    return result.text;
  } finally {
    await parser.destroy();
  }
}
