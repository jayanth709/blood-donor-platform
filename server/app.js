require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes     = require('./src/routes/authRoutes');
const donorRoutes    = require('./src/routes/donorRoutes');
const hospitalRoutes = require('./src/routes/hospitalRoutes');
const adminRoutes    = require('./src/routes/adminRoutes');
const errorHandler   = require('./src/middleware/errorMiddleware');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? true : (process.env.CLIENT_URL || 'http://localhost:5173'),
    credentials: true
  })
);

// ── Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ONLINE',
    platform: 'Real-Time Blood Donor Emergency Response Platform',
    database: 'SQLite (better-sqlite3)',
    timestamp: new Date().toISOString()
  });
});

// ── Public Stats (no auth — used by landing page) ─────────────────────────
app.get('/api/public/stats', (req, res) => {
  try {
    const { getDB } = require('./src/config/db');
    const db = getDB();
    const totalDonors    = db.prepare('SELECT COUNT(*) as c FROM donors').get().c;
    const totalHospitals = db.prepare('SELECT COUNT(*) as c FROM hospitals').get().c;
    const totalRequests  = db.prepare('SELECT COUNT(*) as c FROM emergency_requests').get().c;
    const fulfilled      = db.prepare("SELECT COUNT(*) as c FROM emergency_requests WHERE status = 'FULFILLED'").get().c;
    res.json({ success: true, stats: { totalDonors, totalHospitals, totalRequests, fulfilled } });
  } catch (e) {
    console.error('[public/stats]', e.message);
    res.json({ success: true, stats: { totalDonors: 0, totalHospitals: 0, totalRequests: 0, fulfilled: 0 } });
  }
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/donor',    donorRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/admin',    adminRoutes);

// ── Static Frontend Serving (Unified Deployment) ──────────────────────────
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ── 404 Handler for API routes ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
