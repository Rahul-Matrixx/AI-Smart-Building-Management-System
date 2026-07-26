import express from 'express';
import { createRoom, getRooms, toggleEmergency, updateRoom } from '../controllers/roomController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getRooms);
router.post('/', authenticate, createRoom);
router.put('/:id', authenticate, updateRoom);
router.post('/:id/emergency', authenticate, toggleEmergency);

export default router;