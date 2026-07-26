import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import ruleEngine from './utils/ruleEngine.js';
import { connectToDatabase } from './config/database.js';
import { seedInitialData } from './utils/seedData.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai',aiRoutes);

const startServer = async () => {
  try {
    await connectToDatabase();
    await seedInitialData();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

startServer();

setInterval(() => {
  ruleEngine.simulateAndApplyRules().catch((error) => console.error('Rule engine failed', error));
}, 30000);
