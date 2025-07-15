const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updatePassword,
  getAdmins
} = require('../controllers/auth.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', login);

// Protected routes
router.use(protect); // All routes below this middleware require authentication

// Admin & Authenticator routes
router.get('/me', getMe);
router.put('/updatepassword', updatePassword);

// Admin only routes
router.use(restrictTo('admin')); // All routes below this middleware require admin role
router.post('/register', register);
router.get('/admins', getAdmins);

module.exports = router;