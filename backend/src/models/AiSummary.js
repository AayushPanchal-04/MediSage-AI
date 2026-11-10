import mongoose from 'mongoose';

const aiSummarySchema = new mongoose.Schema(
  {
    record: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord', required: true, unique: true },
    summaryText: { type: String },
    anomalies: { type: String }, // JSON text (the full extracted JSON, as in the original)
    confidenceScore: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AiSummary = mongoose.model('AiSummary', aiSummarySchema);
