import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, default: null },
  licenseNumber: { type: String, default: null },
  hospitalAffiliation: { type: String, default: null },
});

export const Doctor = mongoose.model('Doctor', doctorSchema);
