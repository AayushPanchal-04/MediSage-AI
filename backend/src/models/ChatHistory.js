import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userMessage: { type: String },
  aiResponse: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
