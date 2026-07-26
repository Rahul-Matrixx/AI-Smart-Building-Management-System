import mongoose from 'mongoose';

const energyLogSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  energyUsage: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'energyLogs' });

export default mongoose.model('EnergyLog', energyLogSchema);
