// Port of Exp/GlobalExceptionHandler.java — same { success:false, message, data:null } envelope.
import multer from 'multer';
import mongoose from 'mongoose';
import { AppError } from '../utils/errors.js';
import { failure } from '../utils/apiResponse.js';

export function notFoundHandler(req, res) {
  return failure(res, 404, `Not found: ${req.method} ${req.originalUrl}`);
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) return failure(res, err.status, err.message);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds 10MB limit' : `Upload error: ${err.message}`;
    return failure(res, 400, message);
  }
  if (err.type === 'entity.parse.failed') {
    return failure(res, 400, 'Malformed JSON request body');
  }
  if (err.type === 'entity.too.large') {
    return failure(res, 413, 'Request body too large');
  }
  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
    return failure(res, 400, err.message);
  }

  console.error(err);
  return failure(res, 500, `Something went wrong: ${err.message}`);
}
