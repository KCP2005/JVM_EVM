const Event = require('../models/event.model');
const User = require('../models/user.model');
const uploadUtil = require('../utils/upload.util');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (admin only)
 */
exports.createEvent = async (req, res) => {
  try {
    // Add current admin as creator
    req.body.createdBy = req.admin.id;
    
    // Set a default banner image if not provided
    if (!req.body.bannerImage) {
      req.body.bannerImage = '/uploads/sample-banner.jpg';
    }
    
    // Create event
    const event = await Event.create(req.body);
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

/**
 * @desc    Get all events
 * @route   GET /api/events
 * @access  Private (admin & authenticator)
 */
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get events',
      error: error.message
    });
  }
};

/**
 * @desc    Get active event (for public view)
 * @route   GET /api/events/active
 * @access  Public
 */
exports.getActiveEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ isActive: true });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get active event',
      error: error.message
    });
  }
};

/**
 * @desc    Get single event
 * @route   GET /api/events/:id
 * @access  Private (admin & authenticator)
 */
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get event',
      error: error.message
    });
  }
};

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private (admin only)
 */
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Update event
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

/**
 * @desc    Delete event
 * @route   DELETE /api/events/:id
 * @access  Private (admin only)
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // // Delete banner image if exists
    // if (event.bannerImage) {
    //   const imagePath = path.join(__dirname, '../uploads', path.basename(event.bannerImage));
    //   if (fs.existsSync(imagePath)) {
    //     fs.unlinkSync(imagePath);
    //   }
    // }
    
    console.log(event)
    await Event.findByIdAndDelete(event);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

/**
 * @desc    Upload event banner
 * @route   POST /api/events/:id/banner
 * @access  Private (admin only)
 */
exports.uploadBanner = async (req, res) => {
  try {
    console.log('Upload banner request received for event ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      console.log('Event not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    console.log('Event found:', event.name);
    
    try {
      // Use the new error handling upload function
      const file = await uploadUtil.uploadWithErrorHandling(req, res);
      console.log('File uploaded successfully:', file.filename);
      
      // Delete old banner if exists
      if (event.bannerImage) {
        const oldImagePath = path.join(__dirname, '../uploads', path.basename(event.bannerImage));
        console.log('Checking for old banner at path:', oldImagePath);
        
        if (fs.existsSync(oldImagePath)) {
          console.log('Deleting old banner image');
          try {
            fs.unlinkSync(oldImagePath);
            console.log('Old banner deleted successfully');
          } catch (deleteErr) {
            console.error('Error deleting old banner:', deleteErr);
          }
        } else {
          console.log('Old banner file not found at path');
        }
      }
      
      // Update event with new banner path
      const newBannerPath = `/uploads/${file.filename}`;
      console.log('Setting new banner path:', newBannerPath);
      
      event.bannerImage = newBannerPath;
      
      try {
        const savedEvent = await event.save();
        console.log('Event updated with new banner path');
        
        res.status(200).json({
          success: true,
          data: savedEvent
        });
      } catch (saveErr) {
        console.error('Error saving event with new banner:', saveErr);
        res.status(500).json({
          success: false,
          message: 'Failed to save event with new banner',
          error: saveErr.message
        });
      }
    } catch (uploadError) {
      console.error('Error during file upload:', uploadError);
      return res.status(400).json({
        success: false,
        message: uploadError.message
      });
    }
  } catch (error) {
    console.error('Error in uploadBanner controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload banner',
      error: error.message
    });
  }
};

/**
 * @desc    Set event as active
 * @route   PUT /api/events/:id/activate
 * @access  Private (admin only)
 */
exports.setActiveEvent = async (req, res) => {
  try {
    // First, set all events to inactive
    await Event.updateMany({}, { isActive: false });
    
    // Then set the selected event to active
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set active event',
      error: error.message
    });
  }
};
exports.setDeactiveEvent = async (req, res) => {
  try {
    // First, set all events to inactive
    // await Event.updateMany({}, { isActive: false });
    
    // Then set the selected event to active
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: false }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set deactive event',
      error: error.message
    });
  }
};