import HistoricalUsage from '../models/HistoricalUsage.js';

export const getReports = async (_req, res) => {
  try {
    const logs = await HistoricalUsage.find().sort({ timestamp: -1 }).limit(10).lean();
    const reports = logs.length
      ? [{
          _id: logs[0]._id,
          period: 'Daily',
          energyUsage: Number(logs.reduce((sum, log) => sum + log.energyUsage, 0).toFixed(2)),
          cost: Number((logs.reduce((sum, log) => sum + log.energyUsage, 0) * 0.18).toFixed(2)),
          maintenanceRisk: logs.length > 4 ? 72 : 48,
          generatedAt: new Date()
        }]
      : [{
          _id: 'seed-report',
          period: 'Daily',
          energyUsage: 42.5,
          cost: 7.65,
          maintenanceRisk: 41,
          generatedAt: new Date()
        }];

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const generateReports = async (_req, res) => {
  try {
    const logs = await HistoricalUsage.find().lean();
    const totalEnergy = logs.reduce((sum, log) => sum + log.energyUsage, 0);
    const report = {
      _id: `report-${Date.now()}`,
      period: 'Daily',
      energyUsage: Number(totalEnergy.toFixed(2)),
      cost: Number((totalEnergy * 0.18).toFixed(2)),
      maintenanceRisk: logs.length > 4 ? 72 : 48,
      generatedAt: new Date()
    };
    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};