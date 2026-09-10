import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { createAuthMiddleware } from './middleware/authMiddleware.js';
import { createAuthController } from './controllers/authController.js';
import authRoutes from './routes/authRoutes.js';
import syncRoutes from './routes/syncRoutes.js';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
const users = new Map();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

const auth = createAuthMiddleware(JWT_SECRET);
const authController = createAuthController({ jwtSecret: JWT_SECRET, users });
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'YashOS API', database: mongoose.connection.readyState === 1 ? 'mongodb' : 'memory' }));
app.use('/api/auth', authRoutes(authController, auth));
app.use('/api/sync', syncRoutes(auth));

const start = async () => {
  await connectDatabase(process.env.MONGODB_URI || '');
  app.listen(PORT, () => console.log(`YashOS API running on http://localhost:${PORT}`));
};
start();
