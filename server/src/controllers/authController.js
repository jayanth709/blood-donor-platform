const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_bloodlink_sqlite_jwt_2026!@#$';

// ─── Helper: sign JWT ──────────────────────────────────────────────────────
const signToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── Helper: clean user object (never send password) ──────────────────────
const sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

// ──────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register/donor
// @desc    Register a new donor account + create donor profile
// @access  Public
// ──────────────────────────────────────────────────────────────────────────
const registerDonor = (req, res, next) => {
  try {
    const {
      name, email, password, phone,
      blood_group, date_of_birth, weight,
      has_chronic_illness = false, chronic_illness_details = null,
      last_donation_date = null,
      street = null, area, city, pincode
    } = req.body;

    // Validate required
    if (!name || !email || !password || !phone || !blood_group || !date_of_birth || !weight || !area || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    const db = getDB();

    // Duplicate check
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPwd = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    const donorId = uuidv4();

    const createUserAndDonor = db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?, 'donor')
      `).run(userId, name.trim(), email.toLowerCase().trim(), hashedPwd, phone.trim());

      db.prepare(`
        INSERT INTO donors
          (id, user_id, blood_group, is_available, date_of_birth, weight,
           has_chronic_illness, chronic_illness_details, last_donation_date,
           street, area, city, pincode)
        VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        donorId, userId, blood_group, date_of_birth, Number(weight),
        has_chronic_illness ? 1 : 0,
        chronic_illness_details || null,
        last_donation_date || null,
        street || null, area.trim(), city.trim(), pincode.trim()
      );
    });

    createUserAndDonor();

    const token = signToken(userId, 'donor');

    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
             d.id as donor_id, d.blood_group, d.is_available, d.area, d.city,
             d.total_donations
      FROM users u JOIN donors d ON u.id = d.user_id
      WHERE u.id = ?
    `).get(userId);

    return res.status(201).json({
      success: true,
      message: 'Donor account created successfully.',
      token,
      user,
      data: { token, user }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register/hospital
// @desc    Register hospital + create hospital profile
// @access  Public
// ──────────────────────────────────────────────────────────────────────────
const registerHospital = (req, res, next) => {
  try {
    const {
      name, email, password, phone,
      hospital_name, license_number, contact_person, emergency_phone,
      street = null, area, city, pincode
    } = req.body;

    if (!name || !email || !password || !phone || !hospital_name || !license_number || !contact_person || !emergency_phone || !area || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    const db = getDB();

    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const existingLicense = db.prepare('SELECT id FROM hospitals WHERE license_number = ?').get(license_number);
    if (existingLicense) {
      return res.status(409).json({ success: false, message: 'A hospital with this license number is already registered.' });
    }

    const hashedPwd = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    const hospId = uuidv4();

    const createHospital = db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?, 'hospital')
      `).run(userId, name.trim(), email.toLowerCase().trim(), hashedPwd, phone.trim());

      db.prepare(`
        INSERT INTO hospitals
          (id, user_id, hospital_name, license_number, contact_person, emergency_phone,
           street, area, city, pincode, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified')
      `).run(
        hospId, userId,
        hospital_name.trim(), license_number.trim(),
        contact_person.trim(), emergency_phone.trim(),
        street || null, area.trim(), city.trim(), pincode.trim()
      );
    });

    createHospital();

    const token = signToken(userId, 'hospital');

    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
             h.id as hospital_id, h.hospital_name, h.license_number,
             h.verification_status, h.city
      FROM users u JOIN hospitals h ON u.id = h.user_id
      WHERE u.id = ?
    `).get(userId);

    return res.status(201).json({
      success: true,
      message: 'Hospital account registered. Verification pending review.',
      token,
      user,
      data: { token, user }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login any user (donor | hospital | admin)
// @access  Public
// ──────────────────────────────────────────────────────────────────────────
const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Get role-specific profile data
    let profile = null;
    if (user.role === 'donor') {
      profile = db.prepare('SELECT * FROM donors WHERE user_id = ?').get(user.id);
    } else if (user.role === 'hospital') {
      profile = db.prepare('SELECT * FROM hospitals WHERE user_id = ?').get(user.id);
    }

    const token = signToken(user.id, user.role);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser,
      data: {
        token,
        user: safeUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private (all roles)
// ──────────────────────────────────────────────────────────────────────────
const getMe = (req, res, next) => {
  try {
    const db = getDB();
    let profile = null;

    if (req.user.role === 'donor') {
      profile = db.prepare('SELECT * FROM donors WHERE user_id = ?').get(req.user.id);
    } else if (req.user.role === 'hospital') {
      profile = db.prepare('SELECT * FROM hospitals WHERE user_id = ?').get(req.user.id);
    }

    return res.status(200).json({
      success: true,
      user: { ...req.user, profile }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @desc    Change current user's password
// @access  Private (all roles)
// ──────────────────────────────────────────────────────────────────────────
const changePassword = (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    const isMatch = bcrypt.compareSync(current_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hashed = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerDonor, registerHospital, login, getMe, changePassword };
