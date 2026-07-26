import express from 'express';
import { acknowledgeAlert, getAlerts } from '../controllers/alertController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getAlerts);
router.post('/:id/acknowledge', authenticate, acknowledgeAlert);

export default router;