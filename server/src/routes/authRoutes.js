const express = require('express');
const router = express.Router();
const { registerDonor, registerHospital, login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', (req, res, next) => {
  if (req.body.role === 'hospital') {
    return registerHospital(req, res, next);
  }
  return registerDonor(req, res, next);
});
router.post('/register/donor',    registerDonor);
router.post('/register/hospital', registerHospital);
router.post('/login',             login);

// Protected routes (any logged-in user)
router.get('/me',              protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
