const express = require('express');
const router = express.Router();
const {
  getPlatformStats, getAllUsers, getAllDonors,
  getAllHospitals, getAllEmergencyRequests,
  toggleUserStatus, verifyHospital, deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require a valid JWT + admin role
router.use(protect, authorize('admin'));

router.get('/stats',                              getPlatformStats);
router.get('/overview',                           getPlatformStats);
router.get('/users',                              getAllUsers);
router.get('/donors',                             getAllDonors);
router.get('/hospitals',                          getAllHospitals);
router.get('/emergency-requests',                 getAllEmergencyRequests);
router.get('/requests',                           getAllEmergencyRequests);
router.put('/user/:userId/toggle-status',         toggleUserStatus);
router.put('/hospital/:hospitalId/verify',        verifyHospital);
router.delete('/user/:userId',                    deleteUser);

module.exports = router;
