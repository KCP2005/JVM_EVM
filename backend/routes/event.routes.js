const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public routes
router.get('/active', eventController.getActiveEvent);

// Protected routes
router.use(protect); // All routes below this middleware require authentication

// Admin & Authenticator routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);

// Admin only routes
router.use(restrictTo('admin')); // All routes below this middleware require admin role
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/:id/banner', eventController.uploadBanner);
router.put('/:id/activate', eventController.setActiveEvent);
router.put('/:id/deactivate', eventController.setDeactiveEvent);

module.exports = router;