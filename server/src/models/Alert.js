import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  level: { type: String, default: 'warning' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  acknowledged: { type: Boolean, default: false }
}, { timestamps: true, collection: 'alerts' });

export default mongoose.model('Alert', alertSchema);