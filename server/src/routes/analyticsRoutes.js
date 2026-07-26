import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createEnergyLog,
  createHistoricalUsage,
  createMaintenanceLog,
  createSensorLog,
  getEnergyLogs,
  getHistoricalUsage,
  getMaintenanceLogs,
  getSensorLogs
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/sensor-logs', authenticate, getSensorLogs);
router.post('/sensor-logs', authenticate, createSensorLog);
router.get('/energy-logs', authenticate, getEnergyLogs);
router.post('/energy-logs', authenticate, createEnergyLog);
router.get('/historical-usage', authenticate, getHistoricalUsage);
router.post('/historical-usage', authenticate, createHistoricalUsage);
router.get('/maintenance-logs', authenticate, getMaintenanceLogs);
router.post('/maintenance-logs', authenticate, createMaintenanceLog);

export default router;
