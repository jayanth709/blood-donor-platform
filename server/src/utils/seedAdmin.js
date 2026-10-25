const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/db');

/**
 * SEED DATA
 * Inserts default admin + demo donor + demo hospital on first run.
 * Uses INSERT OR IGNORE so re-runs don't create duplicates.
 */
const seedDatabase = () => {
  const db = getDB();

  const seed = db.transaction(() => {

    // ── 1. ADMIN USER ──────────────────────────────────
    const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
    if (!existingAdmin) {
      const adminId = uuidv4();
      const hashedPwd = bcrypt.hashSync('Admin@BloodLink2025', 10);
      db.prepare(`
        INSERT INTO users (id, name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(adminId, 'Dr. Meera Nambiar', 'admin@bloodlink.gov.in', hashedPwd, '+91 44 2530 5000', 'admin');
      console.log('[Seed] Admin created: admin@bloodlink.gov.in / Admin@BloodLink2025');
    }

    // ── 2. DEMO HOSPITAL USER ──────────────────────────
    const existingHospital = db.prepare('SELECT id FROM users WHERE email = ?').get('emergency@apollohospitals.org');
    if (!existingHospital) {
      const hospUserId = uuidv4();
      const hospProfileId = uuidv4();
      const hashedPwd = bcrypt.hashSync('Hospital@123', 10);

      db.prepare(`
        INSERT INTO users (id, name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(hospUserId, 'Apollo Speciality Hospitals', 'emergency@apollohospitals.org', hashedPwd, '+91 44 2829 0200', 'hospital');

      db.prepare(`
        INSERT INTO hospitals (id, user_id, hospital_name, license_number, contact_person, emergency_phone, street, area, city, pincode, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        hospProfileId, hospUserId,
        'Apollo Speciality Hospitals',
        'TN-CHE-MED-2018-0912',
        'Dr. K. Senthil Kumar (Blood Bank In-Charge)',
        '+91 44 2829 0200',
        'No. 21, Greams Lane, Off Greams Road',
        'Thousand Lights', 'Chennai', '600006', 'verified'
      );
      console.log('[Seed] Demo hospital created: emergency@apollohospitals.org / Hospital@123');
    }

    // ── 3. DEMO DONOR USER ─────────────────────────────
    const existingDonor = db.prepare('SELECT id FROM users WHERE email = ?').get('karthik.donor@example.com');
    if (!existingDonor) {
      const donorUserId = uuidv4();
      const donorProfileId = uuidv4();
      const hashedPwd = bcrypt.hashSync('Donor@123', 10);

      db.prepare(`
        INSERT INTO users (id, name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(donorUserId, 'Karthik Ramanathan', 'karthik.donor@example.com', hashedPwd, '+91 98401 23456', 'donor');

      db.prepare(`
        INSERT INTO donors (id, user_id, blood_group, is_available, date_of_birth, weight, has_chronic_illness, last_donation_date, street, area, city, pincode, total_donations)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        donorProfileId, donorUserId,
        'O+', 1, '1996-05-14', 72, 0,
        '2023-11-20',
        '14, 2nd Avenue, Roundana',
        'Anna Nagar', 'Chennai', '600040', 6
      );
      console.log('[Seed] Demo donor created: karthik.donor@example.com / Donor@123');
    }

    // ── 4. POSTMAN DEMO DONOR ──────────────────────────
    const existingPostmanDonor = db.prepare('SELECT id FROM users WHERE email = ?').get('john.donor@example.com');
    if (!existingPostmanDonor) {
      const uId = uuidv4();
      const pId = uuidv4();
      const hPwd = bcrypt.hashSync('Donor@12345', 10);
      db.prepare(`
        INSERT INTO users (id, name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(uId, 'John Doe', 'john.donor@example.com', hPwd, '+919876500001', 'donor');

      db.prepare(`
        INSERT INTO donors (id, user_id, blood_group, is_available, date_of_birth, weight, has_chronic_illness, street, area, city, pincode, total_donations)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(pId, uId, 'O+', 1, '1998-05-15', 68, 0, '12 MG Road', 'Indiranagar', 'Bengaluru', '560038', 2);
      console.log('[Seed] Postman donor created: john.donor@example.com / Donor@12345');
    }

    // ── 5. POSTMAN DEMO HOSPITAL ───────────────────────
    const existingPostmanHosp = db.prepare('SELECT id FROM users WHERE email = ?').get('citycare@hospital.org');
    if (!existingPostmanHosp) {
      const uId = uuidv4();
      const pId = uuidv4();
      const hPwd = bcrypt.hashSync('Hosp@12345', 10);
      db.prepare(`
        INSERT INTO users (id, name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(uId, 'City Care Super Specialty Hospital', 'citycare@hospital.org', hPwd, '+918025252525', 'hospital');

      db.prepare(`
        INSERT INTO hospitals (id, user_id, hospital_name, license_number, contact_person, emergency_phone, street, area, city, pincode, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        pId, uId,
        'City Care Super Specialty Hospital',
        'HOSP-KA-BLR-2024-8891',
        'Dr. Arvind Sharma',
        '+919888877777',
        '45 Ring Road', 'Indiranagar', 'Bengaluru', '560038', 'verified'
      );
      console.log('[Seed] Postman hospital created: citycare@hospital.org / Hosp@12345');
    }

    // ── 6. POSTMAN DEMO ADMIN ──────────────────────────
    const existingPostmanAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@blooddonor.org');
    if (!existingPostmanAdmin) {
      const uId = uuidv4();
      const hPwd = bcrypt.hashSync('Admin@12345', 10);
      db.prepare(`
        INSERT INTO users (id, name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(uId, 'System Administrator', 'admin@blooddonor.org', hPwd, '+919999900000', 'admin');
      console.log('[Seed] Postman admin created: admin@blooddonor.org / Admin@12345');
    }

  });

  seed();
  console.log('[Seed] Database seeding complete.');
};

module.exports = seedDatabase;
