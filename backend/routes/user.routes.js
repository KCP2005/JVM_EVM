const express = require('express');
const router = express.Router();
const { 
  registerUser,
  getUserByPhone,
  getUsers,
  registerOnSpot,
  checkInUser
} = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', registerUser);
router.get('/phone/:phone', getUserByPhone);

// Protected routes
router.use(protect); // All routes below this middleware require authentication

// Admin & Authenticator routes
router.get('/', getUsers);
router.post('/onspot', registerOnSpot);
router.post('/checkin', checkInUser);

module.exports = router;