const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/db');
const { getCompatibleDonorGroups } = require('../utils/bloodCompatibility');

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/hospital/dashboard
// @desc    Hospital dashboard — stats + active requests
// @access  Private (hospital)
// ──────────────────────────────────────────────────────────────────────────
const getDashboard = (req, res, next) => {
  try {
    const db = getDB();

    const hospital = db.prepare(`
      SELECT h.*, u.name, u.email, u.phone
      FROM hospitals h JOIN users u ON h.user_id = u.id
      WHERE h.user_id = ?
    `).get(req.user.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
    }

    // Active emergency requests
    const activeRequests = db.prepare(`
      SELECT er.*,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = er.id AND dr.status = 'ACCEPTED') as accepted_responses,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = er.id) as total_responses
      FROM emergency_requests er
      WHERE er.hospital_id = ? AND er.status NOT IN ('FULFILLED','CANCELLED')
      ORDER BY er.created_at DESC
    `).all(hospital.id);

    // Request history (last 10 closed)
    const requestHistory = db.prepare(`
      SELECT er.*,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = er.id AND dr.status = 'ACCEPTED') as accepted_responses
      FROM emergency_requests er
      WHERE er.hospital_id = ? AND er.status IN ('FULFILLED','CANCELLED')
      ORDER BY er.created_at DESC
      LIMIT 10
    `).all(hospital.id);

    // Summary stats
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'FULFILLED' THEN 1 ELSE 0 END) as fulfilled,
        SUM(CASE WHEN status NOT IN ('FULFILLED','CANCELLED') THEN 1 ELSE 0 END) as active
      FROM emergency_requests WHERE hospital_id = ?
    `).get(hospital.id);

    return res.status(200).json({
      success: true,
      data: { profile: hospital, activeRequests, requestHistory, stats }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   POST /api/hospital/emergency-request
// @desc    Create a new emergency blood request
// @access  Private (hospital)
// ──────────────────────────────────────────────────────────────────────────
const createEmergencyRequest = (req, res, next) => {
  try {
    const patient_blood_group = req.body.patient_blood_group || req.body.patientBloodGroup;
    const required_units = req.body.required_units || req.body.requiredUnits;
    const urgency = req.body.urgency;
    const patient_case_details = req.body.patient_case_details || req.body.patientCaseDetails || null;
    const street = req.body.street || null;
    const area = req.body.area;
    const city = req.body.city;
    const pincode = req.body.pincode;

    if (!patient_blood_group || !required_units || !urgency || !area || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'Required fields: patient_blood_group, required_units, urgency, area, city, pincode.' });
    }

    const db = getDB();
    const hospital = db.prepare('SELECT * FROM hospitals WHERE user_id = ?').get(req.user.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
    }

    if (hospital.verification_status !== 'verified') {
      return res.status(403).json({ success: false, message: 'Only verified hospitals can post emergency requests.' });
    }

    const requestId = uuidv4();

    db.prepare(`
      INSERT INTO emergency_requests
        (id, hospital_id, patient_blood_group, required_units, urgency,
         patient_case_details, street, area, city, pincode, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SEARCHING')
    `).run(
      requestId, hospital.id,
      patient_blood_group, Number(required_units), urgency,
      patient_case_details, street || null,
      area.trim(), city.trim(), pincode.trim()
    );

    const newRequest = db.prepare('SELECT * FROM emergency_requests WHERE id = ?').get(requestId);
    const requestWithCamel = {
      ...newRequest,
      _id: newRequest.id,
      patientBloodGroup: newRequest.patient_blood_group,
      requiredUnits: newRequest.required_units,
      fulfilledUnits: newRequest.fulfilled_units
    };

    // Find matching donors (compatible blood group, same city, available, no chronic illness)
    const compatibleGroups = getCompatibleDonorGroups(patient_blood_group);
    const placeholders = compatibleGroups.map(() => '?').join(',');

    const matchingDonors = compatibleGroups.length > 0
      ? db.prepare(`
          SELECT d.id, d.blood_group, d.area, d.city, d.pincode, u.name, u.phone
          FROM donors d JOIN users u ON d.user_id = u.id
          WHERE d.blood_group IN (${placeholders})
            AND d.is_available = 1
            AND d.has_chronic_illness = 0
            AND LOWER(d.city) = LOWER(?)
          ORDER BY
            CASE WHEN LOWER(d.area) = LOWER(?) THEN 0 ELSE 1 END,
            d.total_donations ASC
          LIMIT 20
        `).all(...compatibleGroups, city, area)
      : [];

    return res.status(201).json({
      success: true,
      message: 'Emergency request created. Matching donors identified.',
      data: {
        ...requestWithCamel,
        request: requestWithCamel
      },
      matchingDonors: matchingDonors.length,
      matchedDonorList: matchingDonors
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/hospital/emergency-requests
// @desc    All emergency requests for this hospital
// @access  Private (hospital)
// ──────────────────────────────────────────────────────────────────────────
const getEmergencyRequests = (req, res, next) => {
  try {
    const db = getDB();
    const hospital = db.prepare('SELECT id FROM hospitals WHERE user_id = ?').get(req.user.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital profile not found.' });

    const requests = db.prepare(`
      SELECT er.*,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = er.id AND dr.status = 'ACCEPTED') as accepted_responses,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = er.id) as total_responses
      FROM emergency_requests er
      WHERE er.hospital_id = ?
      ORDER BY er.created_at DESC
    `).all(hospital.id);

    return res.status(200).json({ success: true, data: requests, count: requests.length });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   GET /api/hospital/emergency-request/:requestId/donors
// @desc    See which donors responded to a specific request
// @access  Private (hospital)
// ──────────────────────────────────────────────────────────────────────────
const getRequestDonors = (req, res, next) => {
  try {
    const { requestId } = req.params;
    const db = getDB();

    const hospital = db.prepare('SELECT id FROM hospitals WHERE user_id = ?').get(req.user.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital profile not found.' });

    const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ? AND hospital_id = ?').get(requestId, hospital.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found or not owned by this hospital.' });

    const responses = db.prepare(`
      SELECT dr.*, u.name as donor_name, u.phone as donor_phone,
             d.blood_group, d.area, d.city, d.total_donations, d.last_donation_date
      FROM donor_responses dr
      JOIN donors d ON dr.donor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE dr.request_id = ?
      ORDER BY dr.responded_at ASC
    `).all(requestId);

    return res.status(200).json({ success: true, request, responses, count: responses.length });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   PUT /api/hospital/emergency-request/:requestId/status
// @desc    Update request status (FULFILLED / CANCELLED)
// @access  Private (hospital)
// ──────────────────────────────────────────────────────────────────────────
const updateRequestStatus = (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['FULFILLED', 'CANCELLED', 'OPEN', 'SEARCHING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const db = getDB();
    const hospital = db.prepare('SELECT id FROM hospitals WHERE user_id = ?').get(req.user.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital profile not found.' });

    const request = db.prepare('SELECT * FROM emergency_requests WHERE id = ? AND hospital_id = ?').get(requestId, hospital.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    const update = db.transaction(() => {
      db.prepare('UPDATE emergency_requests SET status = ? WHERE id = ?').run(status, requestId);

      // If fulfilled, log donation history for accepted donors
      if (status === 'FULFILLED') {
        const acceptedDonors = db.prepare(`
          SELECT dr.*, d.blood_group, d.total_donations
          FROM donor_responses dr JOIN donors d ON dr.donor_id = d.id
          WHERE dr.request_id = ? AND dr.status = 'ACCEPTED'
        `).all(requestId);

        const hospInfo = db.prepare('SELECT hospital_name, city FROM hospitals WHERE id = ?').get(hospital.id);

        for (const resp of acceptedDonors) {
          // Mark donation as completed
          db.prepare('UPDATE donor_responses SET is_donation_completed = 1 WHERE id = ?').run(resp.id);

          // Insert donation history
          db.prepare(`
            INSERT INTO donation_history
              (id, donor_id, blood_group, units_donated, hospital_name, hospital_city, request_id, donated_at)
            VALUES (?, ?, ?, 1, ?, ?, ?, CURRENT_TIMESTAMP)
          `).run(uuidv4(), resp.donor_id, resp.blood_group, hospInfo.hospital_name, hospInfo.city, requestId);

          // Increment total donations & restore availability
          db.prepare(`
            UPDATE donors SET total_donations = total_donations + 1,
              last_donation_date = DATE('now'),
              is_available = 0
            WHERE id = ?
          `).run(resp.donor_id);

          // Update fulfilled_units
          db.prepare(`
            UPDATE emergency_requests SET fulfilled_units = fulfilled_units + 1 WHERE id = ?
          `).run(requestId);
        }
      }
    });

    update();

    return res.status(200).json({
      success: true,
      message: `Request status updated to ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// @route   PUT /api/hospital/profile
// @desc    Update hospital profile
// @access  Private (hospital)
// ──────────────────────────────────────────────────────────────────────────
const updateProfile = (req, res, next) => {
  try {
    const { contact_person, emergency_phone, street, area, city, pincode } = req.body;
    const db = getDB();

    const fields = [];
    const vals = [];
    if (contact_person) { fields.push('contact_person = ?'); vals.push(contact_person); }
    if (emergency_phone) { fields.push('emergency_phone = ?'); vals.push(emergency_phone); }
    if (street !== undefined) { fields.push('street = ?'); vals.push(street); }
    if (area) { fields.push('area = ?'); vals.push(area); }
    if (city) { fields.push('city = ?'); vals.push(city); }
    if (pincode) { fields.push('pincode = ?'); vals.push(pincode); }

    if (fields.length > 0) {
      vals.push(req.user.id);
      db.prepare(`UPDATE hospitals SET ${fields.join(', ')} WHERE user_id = ?`).run(...vals);
    }

    const updated = db.prepare('SELECT * FROM hospitals WHERE user_id = ?').get(req.user.id);
    return res.status(200).json({ success: true, message: 'Hospital profile updated.', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  createEmergencyRequest,
  getEmergencyRequests,
  getRequestDonors,
  updateRequestStatus,
  updateProfile
};
