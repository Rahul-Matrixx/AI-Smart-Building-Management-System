import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  occupancy: { type: Number, default: 0 },
  temperature: { type: Number, default: 24 },
  acSetpoint: { type: Number, default: 24 },
  lightsOn: { type: Boolean, default: true },
  emergencyMode: { type: Boolean, default: false },
  preCooling: { type: Boolean, default: false },
  status: { type: String, default: 'active' }
}, { timestamps: true, collection: 'rooms' });

export default mongoose.model('Room', roomSchema);