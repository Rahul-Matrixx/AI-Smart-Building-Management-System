import SensorLog from '../models/SensorLog.js';
import EnergyLog from '../models/EnergyLog.js';
import HistoricalUsage from '../models/HistoricalUsage.js';
import MaintenanceLog from '../models/MaintenanceLog.js';

export const getSensorLogs = async (_req, res) => {
  try {
    const logs = await SensorLog.find().populate('roomId').sort({ timestamp: -1 }).limit(20);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSensorLog = async (req, res) => {
  try {
    const log = await SensorLog.create(req.body);
    res.status(201).json({ log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEnergyLogs = async (_req, res) => {
  try {
    const logs = await EnergyLog.find().populate('roomId').sort({ timestamp: -1 }).limit(20);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEnergyLog = async (req, res) => {
  try {
    const log = await EnergyLog.create(req.body);
    res.status(201).json({ log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistoricalUsage = async (_req, res) => {
  try {
    const usage = await HistoricalUsage.find().populate('roomId').sort({ timestamp: -1 }).limit(20);
    res.json({ usage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHistoricalUsage = async (req, res) => {
  try {
    const usage = await HistoricalUsage.create(req.body);
    res.status(201).json({ usage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMaintenanceLogs = async (_req, res) => {
  try {
    const logs = await MaintenanceLog.find().populate(['deviceId', 'roomId']).sort({ timestamp: -1 }).limit(20);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.create(req.body);
    res.status(201).json({ log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
