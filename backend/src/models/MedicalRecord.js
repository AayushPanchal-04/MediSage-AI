import mongoose from 'mongoose';
import { RecordStatus } from './enums.js';

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },

    reportType: { type: String }, // BLOOD_TEST, SCAN, PRESCRIPTION, XRAY ...
    reportName: { type: String },
    visitDate: { type: Date }, // date-only
    fileUrl: { type: String, maxlength: 1000 }, // stored file name inside the upload dir
    originalFileName: { type: String, maxlength: 1000 },

    // AI-extracted JSON kept as a JSON *string* (the UI does JSON.parse(record.extractedData)).
    extractedData: { type: String },

    status: { type: String, enum: Object.values(RecordStatus), default: RecordStatus.PENDING },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
