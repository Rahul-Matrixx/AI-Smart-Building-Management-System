import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  period: { type: String, required: true },
  energyUsage: { type: Number, required: true },
  cost: { type: Number, default: 0 },
  maintenanceRisk: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'historicalUsage' });

export default mongoose.model('Report', reportSchema);