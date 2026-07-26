import Device from '../models/Device.js';
import Alert from '../models/Alert.js';
import MaintenanceLog from '../models/MaintenanceLog.js';

export const getDevices = async (_req, res) => {
  try {
    const devices = await Device.find().populate('roomId').sort({ createdAt: -1 });
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createDevice = async (req, res) => {
  try {
    const device = await Device.create(req.body);
    res.status(201).json({ device });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    await MaintenanceLog.create({
      deviceId: device._id,
      roomId: device.roomId,
      description: `Updated ${device.name}`,
      status: device.status,
      maintenanceScore: device.maintenanceScore
    });

    if (device.maintenanceScore < 70) {
      await Alert.create({ title: 'Maintenance risk', message: `${device.name} requires proactive maintenance`, level: 'warning' });
    }

    res.json({ device });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
