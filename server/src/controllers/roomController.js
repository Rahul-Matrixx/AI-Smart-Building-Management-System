import Room from '../models/Room.js';
import SensorLog from '../models/SensorLog.js';
import HistoricalUsage from '../models/HistoricalUsage.js';
import Alert from '../models/Alert.js';

export const getRooms = async (_req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const energyUsage = room.lightsOn ? 2.2 : 1.1;
    await SensorLog.create({
      roomId: room._id,
      occupancy: room.occupancy,
      temperature: room.temperature,
      acSetpoint: room.acSetpoint,
      lightsOn: room.lightsOn,
      energyUsage
    });

    await HistoricalUsage.create({
      roomId: room._id,
      occupancy: room.occupancy,
      temperature: room.temperature,
      acSetpoint: room.acSetpoint,
      lightsOn: room.lightsOn,
      energyUsage
    });

    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleEmergency = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.emergencyMode = !room.emergencyMode;
    await room.save();
    await Alert.create({
      title: 'Emergency mode updated',
      message: `Emergency mode ${room.emergencyMode ? 'enabled' : 'disabled'} for ${room.name}`,
      level: room.emergencyMode ? 'critical' : 'info'
    });

    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
