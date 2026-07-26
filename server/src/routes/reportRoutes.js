import express from 'express';
import { generateReports, getReports } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getReports);
router.post('/generate', authenticate, generateReports);

export default router;