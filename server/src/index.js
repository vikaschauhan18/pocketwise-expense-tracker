import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';

dotenv.config();
const app = express();
app.use(cors({ origin: (origin, cb) => {
  const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
  if (!origin || allowed.includes(origin)) return cb(null, true);
  return cb(new Error('Not allowed by CORS'));
}}));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Expense Tracker API' }));
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});
const port = process.env.PORT || 5000;
try {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`Expense Tracker API running on port ${port}`));
} catch (err) {
  console.error('Startup failed:', err.message);
  process.exit(1);
}
