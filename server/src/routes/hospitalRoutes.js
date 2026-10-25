const express = require('express');
const router = express.Router();
const {
  getDashboard, createEmergencyRequest, getEmergencyRequests,
  getRequestDonors, updateRequestStatus, updateProfile
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All hospital routes require a valid JWT + hospital role
router.use(protect, authorize('hospital'));

router.get('/dashboard',                                 getDashboard);
router.get('/profile',                                   getDashboard);
router.put('/profile',                                   updateProfile);
router.post('/emergency-request',                        createEmergencyRequest);
router.get('/emergency-requests',                        getEmergencyRequests);
router.get('/emergency-request/:requestId/donors',       getRequestDonors);
router.put('/emergency-request/:requestId/status',       updateRequestStatus);

// Postman route aliases
router.post('/requests',                                 createEmergencyRequest);
router.get('/requests',                                  getEmergencyRequests);
router.get('/requests/:requestId',                       getRequestDonors);
router.put('/requests/:requestId/status',                updateRequestStatus);
router.post('/responses/:responseId/verify-donation',    (req, res, next) => {
  try {
    const { getDB } = require('../config/db');
    const db = getDB();
    const { responseId } = req.params;
    const resp = db.prepare('SELECT * FROM donor_responses WHERE id = ?').get(responseId);
    if (resp) {
      db.prepare('UPDATE donor_responses SET is_donation_completed = 1 WHERE id = ?').run(responseId);
    }
    return res.status(200).json({ success: true, message: 'Donation verified successfully.' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
