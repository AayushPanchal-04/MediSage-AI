import mongoose from 'mongoose';

// Path/query ids come in as strings; anything that isn't a 24-char hex ObjectId can't exist,
// so callers treat it as "not found" instead of surfacing a Mongoose CastError.
export const isObjectId = (v) => typeof v === 'string' && mongoose.isValidObjectId(v) && /^[0-9a-fA-F]{24}$/.test(v);
