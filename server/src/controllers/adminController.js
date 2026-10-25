const { getDB } = require('../config/db');
const bcrypt = require('bcryptjs');

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/stats
// @desc    Platform-wide statistics
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────────────────
const getPlatformStats = (req, res, next) => {
  try {
    const db = getDB();

    const totalDonors    = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('donor');
    const totalHospitals = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('hospital');
    const totalRequests  = db.prepare('SELECT COUNT(*) as count FROM emergency_requests').get();
    const fulfilledReqs  = db.prepare("SELECT COUNT(*) as count FROM emergency_requests WHERE status = 'FULFILLED'").get();
    const activeReqs     = db.prepare("SELECT COUNT(*) as count FROM emergency_requests WHERE status NOT IN ('FULFILLED','CANCELLED')").get();
    const totalDonations = db.prepare('SELECT COUNT(*) as count FROM donation_history').get();
    const availableDonors = db.prepare('SELECT COUNT(*) as count FROM donors WHERE is_available = 1').get();

    // Blood group distribution
    const bloodGroupStats = db.prepare(`
      SELECT blood_group, COUNT(*) as count FROM donors GROUP BY blood_group ORDER BY blood_group
    `).all();

    // Recent emergency requests (last 5)
    const recentRequests = db.prepare(`
      SELECT er.*, h.hospital_name, h.city as hospital_city
      FROM emergency_requests er
      JOIN hospitals h ON er.hospital_id = h.id
      ORDER BY er.created_at DESC LIMIT 5
    `).all();

    return res.status(200).json({
      success: true,
      stats: {
        totalDonors: totalDonors.count,
        totalHospitals: totalHospitals.count,
        totalRequests: totalRequests.count,
        fulfilledRequests: fulfilledReqs.count,
        activeRequests: activeReqs.count,
        totalDonations: totalDonations.count,
        availableDonors: availableDonors.count,
        fulfillmentRate: totalRequests.count > 0
          ? Math.round((fulfilledReqs.count / totalRequests.count) * 100)
          : 0
      },
      bloodGroupStats,
      recentRequests
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/users
// @desc    List all users with filters
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────────────────
const getAllUsers = (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const db = getDB();
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const params = [];

    if (role && ['donor', 'hospital', 'admin'].includes(role)) {
      where += ' AND u.role = ?';
      params.push(role);
    }
    if (search) {
      where += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at
      FROM users u
      WHERE ${where}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);

    const total = db.prepare(`SELECT COUNT(*) as count FROM users u WHERE ${where}`).get(...params);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total: total.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total.count / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/donors
// @desc    All donor profiles with full details
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────────────────
const getAllDonors = (req, res, next) => {
  try {
    const { blood_group, city, available, page = 1, limit = 20 } = req.query;
    const db = getDB();
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const params = [];

    if (blood_group) { where += ' AND d.blood_group = ?'; params.push(blood_group); }
    if (city) { where += ' AND LOWER(d.city) = LOWER(?)'; params.push(city); }
    if (available !== undefined) { where += ' AND d.is_available = ?'; params.push(available === 'true' ? 1 : 0); }

    const donors = db.prepare(`
      SELECT d.*, u.name, u.email, u.phone, u.is_active
      FROM donors d JOIN users u ON d.user_id = u.id
      WHERE ${where}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM donors d JOIN users u ON d.user_id = u.id WHERE ${where}
    `).get(...params);

    return res.status(200).json({
      success: true,
      data: donors,
      pagination: { total: total.count, page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/hospitals
// @desc    All hospital profiles
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────────────────
const getAllHospitals = (req, res, next) => {
  try {
    const { verification_status, city, page = 1, limit = 20 } = req.query;
    const db = getDB();
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const params = [];

    if (verification_status) { where += ' AND h.verification_status = ?'; params.push(verification_status); }
    if (city) { where += ' AND LOWER(h.city) = LOWER(?)'; params.push(city); }

    const hospitals = db.prepare(`
      SELECT h.*, u.name, u.email, u.phone, u.is_active,
        (SELECT COUNT(*) FROM emergency_requests er WHERE er.hospital_id = h.id) as total_requests,
        (SELECT COUNT(*) FROM emergency_requests er WHERE er.hospital_id = h.id AND er.status = 'FULFILLED') as fulfilled_requests
      FROM hospitals h JOIN users u ON h.user_id = u.id
      WHERE ${where}
      ORDER BY h.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM hospitals h JOIN users u ON h.user_id = u.id WHERE ${where}
    `).get(...params);

    return res.status(200).json({
      success: true,
      data: hospitals,
      pagination: { total: total.count, page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/emergency-requests
// @desc    All emergency requests platform-wide
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────────────────
const getAllEmergencyRequests = (req, res, next) => {
  try {
    const { status, urgency, blood_group, page = 1, limit = 20 } = req.query;
    const db = getDB();
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const params = [];

    if (status) { where += ' AND er.status = ?'; params.push(status); }
    if (urgency) { where += ' AND er.urgency = ?'; params.push(urgency); }
    if (blood_group) { where += ' AND er.patient_blood_group = ?'; params.push(blood_group); }

    const requests = db.prepare(`
      SELECT er.*, h.hospital_name, h.city as hospital_city, h.emergency_phone,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = er.id AND dr.status = 'ACCEPTED') as accepted_responses,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = er.id) as total_responses
      FROM emergency_requests er
      JOIN hospitals h ON er.hospital_id = h.id
      WHERE ${where}
      ORDER BY
        CASE er.urgency WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 ELSE 3 END,
        er.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM emergency_requests er WHERE ${where}
    `).get(...params);

    return res.status(200).json({
      success: true,
      data: requests,
      pagination: { total: total.count, page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   PUT /api/admin/user/:userId/toggle-status
// @desc    Activate / suspend any user
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────────────────
const toggleUserStatus = (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = getDB();

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot suspend admin accounts.' });

    const newStatus = user.is_active ? 0 : 1;
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, userId);

    return res.status(200).json({
      success: true,
      message: `User account ${newStatus ? 'activated' : 'suspended'}.`,
      is_active: Boolean(newStatus)
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   PUT /api/admin/hospital/:hospitalId/verify
// @desc    Verify or reject a hospital
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────────────────
const verifyHospital = (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const { verification_status } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(verification_status)) {
      return res.status(400).json({ success: false, message: 'Status must be verified, rejected, or pending.' });
    }

    const db = getDB();
    const hospital = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(hospitalId);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found.' });

    db.prepare('UPDATE hospitals SET verification_status = ? WHERE id = ?').run(verification_status, hospitalId);

    return res.status(200).json({
      success: true,
      message: `Hospital verification status set to '${verification_status}'.`
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/admin/user/:userId
// @desc    Permanently delete a user (and all associated data via CASCADE)
// @access  Private (admin)
// ──────────────────────────────────────────────────────────────────────────
const deleteUser = (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = getDB();

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin accounts.' });
    if (userId === req.user.id) return res.status(403).json({ success: false, message: 'Cannot delete your own account.' });

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    return res.status(200).json({ success: true, message: `User '${user.name}' permanently deleted.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  getAllDonors,
  getAllHospitals,
  getAllEmergencyRequests,
  toggleUserStatus,
  verifyHospital,
  deleteUser
};
