import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  description: { type: String, required: true },
  status: { type: String, default: 'online' },
  maintenanceScore: { type: Number, default: 90 },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'maintenanceLogs' });

export default mongoose.model('MaintenanceLog', maintenanceLogSchema);
