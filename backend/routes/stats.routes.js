const express = require('express');
const router = express.Router();
const { 
  getGenderStats,
  getCityStats,
  getCheckInStats,
  getRegistrationStats,
  getDashboardStats
} = require('../controllers/stats.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Routes accessible by both admin and authenticator
router.get('/dashboard', getDashboardStats);

// Admin only routes
router.use(restrictTo('admin')); // All routes below this middleware require admin role
router.get('/gender', getGenderStats);
router.get('/city', getCityStats);
router.get('/checkin', getCheckInStats);
router.get('/registration', getRegistrationStats);

module.exports = router;