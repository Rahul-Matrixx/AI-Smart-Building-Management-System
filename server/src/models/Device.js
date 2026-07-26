import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  status: { type: String, default: 'online' },
  powerDraw: { type: Number, default: 1.5 },
  maintenanceScore: { type: Number, default: 90 },
  lastMaintenance: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'devices' });

export default mongoose.model('Device', deviceSchema);