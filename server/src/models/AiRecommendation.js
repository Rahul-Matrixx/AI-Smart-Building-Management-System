import mongoose from 'mongoose';

const aiRecommendationSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomName: { type: String, required: true },
  occupancy: { type: Number, default: 0 },
  temperature: { type: Number, default: 24 },
  energyUsage: { type: Number, default: 0 },
  recommendedTemperature: { type: Number, default: 24 },
  recommendedAction: { type: String, default: 'Maintain current settings' },
  expectedEnergySaving: { type: Number, default: 0 },
  comfortScore: { type: Number, default: 90 },
  riskLevel: { type: String, default: 'Low' },
  actions: [{ type: String }],
  status: { type: String, default: 'active' }
}, { timestamps: true, collection: 'aiRecommendations' });

export default mongoose.model('AiRecommendation', aiRecommendationSchema);
