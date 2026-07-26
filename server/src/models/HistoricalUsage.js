import mongoose from 'mongoose';

const historicalUsageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  occupancy: { type: Number, required: true },
  temperature: { type: Number, required: true },
  acSetpoint: { type: Number, required: true },
  lightsOn: { type: Boolean, required: true },
  energyUsage: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'historicalUsage' });

export default mongoose.model('HistoricalUsage', historicalUsageSchema);
