const { getDB } = require('../config/db');
const { checkEligibility } = require('../utils/bloodCompatibility');

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/donor/dashboard
// @desc    Get donor's full dashboard data (profile + stats + history)
// @access  Private (donor)
// ──────────────────────────────────────────────────────────────────────────
const getDashboard = (req, res, next) => {
  try {
    const db = getDB();

    const donor = db.prepare(`
      SELECT d.*, u.name, u.email, u.phone
      FROM donors d JOIN users u ON d.user_id = u.id
      WHERE d.user_id = ?
    `).get(req.user.id);

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    // Eligibility check
    const { isEligible, reasons } = checkEligibility(donor);

    // Recent donation history (last 5)
    const recentHistory = db.prepare(`
      SELECT * FROM donation_history
      WHERE donor_id = ?
      ORDER BY donated_at DESC
      LIMIT 5
    `).all(donor.id);

    // Active responses (requests this donor responded to)
    const activeResponses = db.prepare(`
      SELECT dr.*, er.patient_blood_group, er.urgency, er.status as request_status,
             er.city as request_city, er.area as request_area,
             h.hospital_name, h.emergency_phone as hospital_phone
      FROM donor_responses dr
      JOIN emergency_requests er ON dr.request_id = er.id
      JOIN hospitals h ON er.hospital_id = h.id
      WHERE dr.donor_id = ?
      ORDER BY dr.responded_at DESC
      LIMIT 10
    `).all(donor.id);

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          ...donor,
          isEligible,
          eligibilityReasons: reasons
        },
        recentHistory,
        activeResponses,
        stats: {
          total_donations: donor.total_donations,
          is_available: Boolean(donor.is_available),
          isEligible,
          bloodGroup: donor.blood_group
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   PUT /api/donor/profile
// @desc    Update donor profile
// @access  Private (donor)
// ──────────────────────────────────────────────────────────────────────────
const updateProfile = (req, res, next) => {
  try {
    const db = getDB();
    const {
      name, phone,
      weight, has_chronic_illness, chronic_illness_details,
      street, area, city, pincode
    } = req.body;

    // Update user table
    if (name || phone) {
      const fields = [];
      const vals = [];
      if (name) { fields.push('name = ?'); vals.push(name.trim()); }
      if (phone) { fields.push('phone = ?'); vals.push(phone.trim()); }
      vals.push(req.user.id);
      db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
    }

    // Update donor table
    const donorFields = [];
    const donorVals = [];
    if (weight !== undefined) { donorFields.push('weight = ?'); donorVals.push(Number(weight)); }
    if (has_chronic_illness !== undefined) { donorFields.push('has_chronic_illness = ?'); donorVals.push(has_chronic_illness ? 1 : 0); }
    if (chronic_illness_details !== undefined) { donorFields.push('chronic_illness_details = ?'); donorVals.push(chronic_illness_details); }
    if (street !== undefined) { donorFields.push('street = ?'); donorVals.push(street); }
    if (area) { donorFields.push('area = ?'); donorVals.push(area.trim()); }
    if (city) { donorFields.push('city = ?'); donorVals.push(city.trim()); }
    if (pincode) { donorFields.push('pincode = ?'); donorVals.push(pincode.trim()); }

    if (donorFields.length > 0) {
      donorVals.push(req.user.id);
      db.prepare(`UPDATE donors SET ${donorFields.join(', ')} WHERE user_id = ?`).run(...donorVals);
    }

    const updated = db.prepare(`
      SELECT d.*, u.name, u.email, u.phone
      FROM donors d JOIN users u ON d.user_id = u.id
      WHERE d.user_id = ?
    `).get(req.user.id);

    return res.status(200).json({ success: true, message: 'Profile updated.', data: updated });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   PUT /api/donor/availability
// @desc    Toggle donor availability (available / unavailable)
// @access  Private (donor)
// ──────────────────────────────────────────────────────────────────────────
const toggleAvailability = (req, res, next) => {
  try {
    const db = getDB();
    const { is_available } = req.body;

    if (typeof is_available !== 'boolean' && is_available !== 0 && is_available !== 1) {
      return res.status(400).json({ success: false, message: '`is_available` must be a boolean.' });
    }

    db.prepare('UPDATE donors SET is_available = ? WHERE user_id = ?').run(is_available ? 1 : 0, req.user.id);

    return res.status(200).json({
      success: true,
      message: `Availability set to ${is_available ? 'AVAILABLE' : 'UNAVAILABLE'}.`,
      is_available: Boolean(is_available)
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/donor/emergency-alerts
// @desc    Get open emergency requests matching donor's blood group & location
// @access  Private (donor)
// ──────────────────────────────────────────────────────────────────────────
const getEmergencyAlerts = (req, res, next) => {
  try {
    const db = getDB();

    const donor = db.prepare('SELECT * FROM donors WHERE user_id = ?').get(req.user.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    // Blood group compatibility: get groups that match this donor's group as a possible donor
    const { COMPATIBLE_DONORS } = require('../utils/bloodCompatibility');

    // Find all emergency requests where this donor's blood group is compatible
    const compatibleRecipients = Object.keys(COMPATIBLE_DONORS).filter(
      recipientGroup => COMPATIBLE_DONORS[recipientGroup].includes(donor.blood_group)
    );

    if (compatibleRecipients.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const placeholders = compatibleRecipients.map(() => '?').join(',');
    const alerts = db.prepare(`
      SELECT er.*, h.hospital_name, h.emergency_phone, h.city as hospital_city,
             h.area as hospital_area,
             (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = er.id AND dr.status = 'ACCEPTED') as responses_count
      FROM emergency_requests er
      JOIN hospitals h ON er.hospital_id = h.id
      WHERE er.status IN ('OPEN','SEARCHING')
        AND er.patient_blood_group IN (${placeholders})
      ORDER BY
        CASE er.urgency WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 ELSE 3 END,
        er.created_at DESC
    `).all(...compatibleRecipients);

    // Check if donor already responded to each
    const enriched = alerts.map(alert => {
      const myResponse = db.prepare(`
        SELECT status FROM donor_responses WHERE request_id = ? AND donor_id = ?
      `).get(alert.id, donor.id);
      return { ...alert, my_response: myResponse?.status || null };
    });

    return res.status(200).json({ success: true, data: enriched, count: enriched.length });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   POST /api/donor/respond/:requestId
// @desc    Donor responds (accept / reject) to an emergency request
// @access  Private (donor)
// ──────────────────────────────────────────────────────────────────────────
const respondToRequest = (req, res, next) => {
  try {
    const { requestId } = req.params;
    const status = req.body.status;
    const response_notes = req.body.response_notes || req.body.responseNotes || null;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be ACCEPTED or REJECTED.' });
    }

    const db = getDB();
    const donor = db.prepare('SELECT * FROM donors WHERE user_id = ?').get(req.user.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found.' });

    const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Emergency request not found.' });

    if (!['OPEN', 'SEARCHING'].includes(request.status)) {
      return res.status(409).json({ success: false, message: 'This emergency request is no longer active.' });
    }

    // Upsert donor response
    const { v4: uuidv4 } = require('uuid');
    const existing = db.prepare('SELECT * FROM donor_responses WHERE request_id = ? AND donor_id = ?').get(requestId, donor.id);

    const respond = db.transaction(() => {
      if (existing) {
        db.prepare(`
          UPDATE donor_responses SET status = ?, response_notes = ?, responded_at = CURRENT_TIMESTAMP
          WHERE request_id = ? AND donor_id = ?
        `).run(status, response_notes, requestId, donor.id);
      } else {
        db.prepare(`
          INSERT INTO donor_responses (id, request_id, donor_id, status, response_notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(uuidv4(), requestId, donor.id, status, response_notes);
      }

      // Update request status to reflect responses
      if (status === 'ACCEPTED') {
        db.prepare(`
          UPDATE emergency_requests SET status = 'RESPONSE_RECEIVED' WHERE id = ? AND status = 'SEARCHING'
        `).run(requestId);

        // Mark donor temporarily unavailable after accepting
        db.prepare('UPDATE donors SET is_available = 0 WHERE id = ?').run(donor.id);
      }
    });

    respond();

    const responseRow = db.prepare('SELECT * FROM donor_responses WHERE request_id = ? AND donor_id = ?').get(requestId, donor.id);

    return res.status(200).json({
      success: true,
      message: status === 'ACCEPTED'
        ? 'You have accepted this request. The hospital will contact you shortly.'
        : 'You have declined this request.',
      status,
      data: {
        ...responseRow,
        _id: responseRow?.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/donor/history
// @desc    Full donation history for logged-in donor
// @access  Private (donor)
// ──────────────────────────────────────────────────────────────────────────
const getDonationHistory = (req, res, next) => {
  try {
    const db = getDB();
    const donor = db.prepare('SELECT id FROM donors WHERE user_id = ?').get(req.user.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found.' });

    const history = db.prepare(`
      SELECT * FROM donation_history WHERE donor_id = ?
      ORDER BY donated_at DESC
    `).all(donor.id);

    return res.status(200).json({ success: true, data: history, count: history.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  updateProfile,
  toggleAvailability,
  getEmergencyAlerts,
  respondToRequest,
  getDonationHistory
};
