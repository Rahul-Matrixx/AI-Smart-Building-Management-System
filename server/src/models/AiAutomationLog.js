import mongoose from 'mongoose';

const aiAutomationLogSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomName: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, default: 'info' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'aiAutomationLogs' });

export default mongoose.model('AiAutomationLog', aiAutomationLogSchema);
