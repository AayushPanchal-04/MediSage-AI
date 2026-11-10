import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date, default: null }, // date-only (see utils/dates.js)
  bloodGroup: { type: String, default: null },
  allergies: { type: String, default: null }, // comma-separated: "Penicillin,Dust,Pollen"
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
});

export const Patient = mongoose.model('Patient', patientSchema);
