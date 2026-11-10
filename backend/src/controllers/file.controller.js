// Port of Controller/FileController.java
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { failure } from '../utils/apiResponse.js';

const CONTENT_TYPES = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

export const getFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve(env.uploadDir, filename);

  // keep reads inside the upload directory (Paths.resolve(..).normalize() equivalent)
  if (!filePath.startsWith(env.uploadDir + path.sep)) {
    return failure(res, 400, 'Invalid file name');
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return failure(res, 404, 'File not found');
  }

  const contentType = CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? 'application/octet-stream';
  res.type(contentType);
  return res.sendFile(filePath);
};
