import Alert from '../models/Alert.js';

export const getAlerts = async (_req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
