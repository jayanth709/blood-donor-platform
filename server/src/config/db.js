const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Store the database file in the server root for easy access with DB Browser
const DB_PATH = path.join(__dirname, '../../database.sqlite');

let db;

/**
 * Initialize SQLite database connection.
 * better-sqlite3 is SYNCHRONOUS — no async/await needed.
 * Returns the db instance for use across the application.
 */
const connectDB = () => {
  try {
    db = new Database(DB_PATH, {
      // Enable WAL mode for better concurrent read performance
      // WAL = Write-Ahead Logging (standard for production SQLite)
      verbose: process.env.NODE_ENV === 'development' ? console.log : null
    });

    // Enable WAL mode and Foreign Key enforcement
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    console.log(`[SQLite] Connected: ${DB_PATH}`);
    return db;
  } catch (error) {
    console.error('[SQLite] Connection failed:', error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('[SQLite] Database not initialized. Call connectDB() first.');
  }
  return db;
};

module.exports = { connectDB, getDB };
