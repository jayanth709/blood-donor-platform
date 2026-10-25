require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./src/config/db');
const { createTables } = require('./src/config/schema');
const seedDatabase = require('./src/utils/seedAdmin');

const PORT = process.env.PORT || 5000;

// ── 1. Connect to SQLite ──────────────────────────────────────────────────
connectDB();

// ── 2. Create tables (idempotent) ─────────────────────────────────────────
createTables();

// ── 3. Seed initial data (admin + demo users) ─────────────────────────────
seedDatabase();

// ── 4. Start HTTP server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║   🩸 BloodLink API Server                            ║`);
  console.log(`║   Running on  http://localhost:${PORT}                ║`);
  console.log(`║   Database    SQLite (better-sqlite3)                ║`);
  console.log(`║   Environment ${process.env.NODE_ENV || 'development'}                       ║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);
});
