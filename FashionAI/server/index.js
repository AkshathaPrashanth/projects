import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Pattern, ActivityLog } from './models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const DB_TYPE = process.env.DB_TYPE || 'mongodb';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/fashionai';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Global Request Logger to capture "Docker-style" logs in the DB
app.use(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const logEntry = new ActivityLog({
      id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: 'system',
      userName: 'Network Stack',
      action: `${req.method} ${req.path}`,
      detail: `Status: ${res.statusCode} | Latency: ${duration}ms | IP: ${req.ip}`,
      timestamp: Date.now(),
      type: res.statusCode >= 400 ? 'error' : 'info'
    });
    try { await logEntry.save(); } catch (e) { console.error("Log save failed", e); }
  });
  next();
});

// Database Initialization with Retry Logic
const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ DATABASE CONNECTED');
      break;
    } catch (err) {
      console.error(`❌ DB Connection failed. Retries left: ${retries-1}`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

connectDB();

// API Router
const apiRouter = express.Router();

apiRouter.get('/stats', async (req, res) => {
  try {
    const [totalDesigns, totalUsers, adminCount] = await Promise.all([
      Pattern.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: 'admin' })
    ]);
    res.json({
      totalDesigns,
      totalUsers,
      adminCount,
      dbStatus: mongoose.connection.readyState === 1 ? 'Live Cluster' : 'Connecting...',
      driver: 'Standard Node Driver'
    });
  } catch (err) {
    res.json({ totalDesigns: 0, totalUsers: 0, adminCount: 0, dbStatus: 'Error', driver: 'Failed' });
  }
});

apiRouter.get('/patterns', async (req, res) => {
  try {
    const patterns = await Pattern.find().sort({ timestamp: -1 });
    res.json(patterns || []);
  } catch (err) { res.status(500).json([]); }
});

apiRouter.post('/patterns', async (req, res) => {
  try {
    const pattern = new Pattern(req.body);
    await pattern.save();
    res.json({ success: true, id: pattern.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.post('/users', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { ...req.body, lastLogin: Date.now() },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ lastLogin: -1 });
    res.json(users || []);
  } catch (err) { res.status(500).json([]); }
});

apiRouter.post('/logs', async (req, res) => {
  try {
    const log = new ActivityLog(req.body);
    await log.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

apiRouter.get('/logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs || []);
  } catch (err) { res.status(500).json([]); }
});

app.use('/api', apiRouter);

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FashionDesignAI Production Server at port ${PORT}`);
});