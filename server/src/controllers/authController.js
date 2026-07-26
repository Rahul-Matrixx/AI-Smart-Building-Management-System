import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '8h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

export const seedAdmin = async (_req, res) => {
  try {
    const existing = await User.findOne({ email: 'admin@honeywell.com' });
    if (existing) return res.json({ message: 'Admin already exists' });

    const hashed = await bcrypt.hash('password123', 10);
    await User.create({ name: 'Admin', email: 'admin@honeywell.com', password: hashed, role: 'admin' });
    res.json({ message: 'Admin created' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to seed admin', error: err.message });
  }
};