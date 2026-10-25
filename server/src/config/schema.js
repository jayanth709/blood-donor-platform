const { getDB } = require('../config/db');

/**
 * CREATE ALL TABLES
 * Runs once on server startup.
 * Uses "IF NOT EXISTS" so it's safe to run multiple times (idempotent).
 */
const createTables = () => {
  const db = getDB();

  // Run all CREATE TABLE statements in a single transaction for atomicity
  const createAll = db.transaction(() => {

    // ─────────────────────────────────────────────
    // 1. USERS — Authentication & Role-Based Access
    // ─────────────────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        email       TEXT UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        phone       TEXT NOT NULL,
        role        TEXT NOT NULL CHECK(role IN ('donor', 'hospital', 'admin')),
        is_active   INTEGER NOT NULL DEFAULT 1,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─────────────────────────────────────────────
    // 2. DONORS — Profile & Medical Eligibility Info
    // ─────────────────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS donors (
        id                      TEXT PRIMARY KEY,
        user_id                 TEXT NOT NULL UNIQUE,
        blood_group             TEXT NOT NULL CHECK(blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
        is_available            INTEGER NOT NULL DEFAULT 1,
        date_of_birth           TEXT NOT NULL,
        weight                  REAL NOT NULL,
        has_chronic_illness     INTEGER NOT NULL DEFAULT 0,
        chronic_illness_details TEXT,
        last_donation_date      TEXT,
        street                  TEXT,
        area                    TEXT NOT NULL,
        city                    TEXT NOT NULL,
        pincode                 TEXT NOT NULL,
        total_donations         INTEGER NOT NULL DEFAULT 0,
        created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // ─────────────────────────────────────────────
    // 3. HOSPITALS — Profile & Accreditation
    // ─────────────────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS hospitals (
        id                  TEXT PRIMARY KEY,
        user_id             TEXT NOT NULL UNIQUE,
        hospital_name       TEXT NOT NULL,
        license_number      TEXT NOT NULL UNIQUE,
        contact_person      TEXT NOT NULL,
        emergency_phone     TEXT NOT NULL,
        street              TEXT,
        area                TEXT NOT NULL,
        city                TEXT NOT NULL,
        pincode             TEXT NOT NULL,
        verification_status TEXT NOT NULL DEFAULT 'verified'
                              CHECK(verification_status IN ('pending','verified','rejected')),
        created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // ─────────────────────────────────────────────
    // 4. EMERGENCY REQUESTS — Hospital Blood Broadcasts
    // ─────────────────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS emergency_requests (
        id                   TEXT PRIMARY KEY,
        hospital_id          TEXT NOT NULL,
        patient_blood_group  TEXT NOT NULL CHECK(patient_blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
        required_units       INTEGER NOT NULL,
        fulfilled_units      INTEGER NOT NULL DEFAULT 0,
        urgency              TEXT NOT NULL CHECK(urgency IN ('CRITICAL','HIGH','NORMAL')),
        patient_case_details TEXT,
        street               TEXT,
        area                 TEXT NOT NULL,
        city                 TEXT NOT NULL,
        pincode              TEXT NOT NULL,
        status               TEXT NOT NULL DEFAULT 'SEARCHING'
                               CHECK(status IN ('OPEN','SEARCHING','RESPONSE_RECEIVED','FULFILLED','CANCELLED')),
        created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
      );
    `);

    // ─────────────────────────────────────────────
    // 5. DONOR RESPONSES — Donor accept/reject decisions
    // ─────────────────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS donor_responses (
        id                    TEXT PRIMARY KEY,
        request_id            TEXT NOT NULL,
        donor_id              TEXT NOT NULL,
        status                TEXT NOT NULL CHECK(status IN ('PENDING','ACCEPTED','REJECTED')),
        response_notes        TEXT,
        is_donation_completed INTEGER NOT NULL DEFAULT 0,
        responded_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (donor_id)   REFERENCES donors(id) ON DELETE CASCADE,
        UNIQUE(request_id, donor_id)
      );
    `);

    // ─────────────────────────────────────────────
    // 6. DONATION HISTORY — Verified past donations
    // ─────────────────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS donation_history (
        id            TEXT PRIMARY KEY,
        donor_id      TEXT NOT NULL,
        blood_group   TEXT NOT NULL,
        units_donated INTEGER NOT NULL DEFAULT 1,
        hospital_name TEXT NOT NULL,
        hospital_city TEXT NOT NULL,
        request_id    TEXT,
        remarks       TEXT,
        donated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
      );
    `);

    console.log('[SQLite] All tables created / verified.');
  });

  createAll();
};

module.exports = { createTables };
