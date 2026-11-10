import mongoose from 'mongoose';

// Caches every generated AI insight so a page view does not cost a new Groq call.
// sourceHash is a fingerprint of the input records: when a report is uploaded or re-analysed the
// hash changes and the insight is regenerated automatically on the next view.
const aiInsightSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "CARE_PLAN:patient:<id>"
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null, index: true },
  type: { type: String, required: true },
  payload: { type: String }, // the AI JSON text
  sourceHash: { type: String },
  generatedAt: { type: Date, default: Date.now },
});

export const AiInsight = mongoose.model('AiInsight', aiInsightSchema);
