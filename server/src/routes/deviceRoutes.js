import express from 'express';
import { createDevice, getDevices, updateDevice } from '../controllers/deviceController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getDevices);
router.post('/', authenticate, createDevice);
router.put('/:id', authenticate, updateDevice);

export default router;