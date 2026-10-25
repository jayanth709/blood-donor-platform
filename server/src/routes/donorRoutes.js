const express = require('express');
const router = express.Router();
const {
  getDashboard, updateProfile, toggleAvailability,
  getEmergencyAlerts, respondToRequest, getDonationHistory
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All donor routes require a valid JWT + donor role
router.use(protect, authorize('donor'));

router.get('/dashboard',              getDashboard);
router.get('/profile',                getDashboard);
router.put('/profile',                updateProfile);
router.put('/availability',           toggleAvailability);
router.patch('/availability',         toggleAvailability);
router.get('/emergency-alerts',       getEmergencyAlerts);
router.get('/emergency-requests',     getEmergencyAlerts);
router.post('/respond/:requestId',    respondToRequest);
router.post('/emergency-requests/:requestId/respond', respondToRequest);
router.get('/history',                getDonationHistory);

module.exports = router;
