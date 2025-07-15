const User = require('../models/user.model');
const Event = require('../models/event.model');
const { generateQRCode, generateQRCodeSVG } = require('../utils/qrcode.util');

/**
 * @desc    Register a new user for an event
 * @route   POST /api/users/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, gender, address, isNamdharak } = req.body;
    
    // Get active event
    const activeEvent = await Event.findOne({ isActive: true });
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Check if user with phone already exists
    let user = await User.findOne({ phone });
    
    if (user) {
      // Check if user is already registered for this event
      const alreadyRegistered = user.registeredEvents.includes(activeEvent._id);
      
      if (alreadyRegistered) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered for this event',
          isRegistered: true,
          userId: user._id
        });
      }
      
      // Update existing user and add this event
      user.registeredEvents.push(activeEvent._id);
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        phone,
        gender,
        address,
        isNamdharak: isNamdharak || false,
        registeredEvents: [activeEvent._id],
        registrationMethod: 'self'
      });
    }
    
    // Update event with registered user
    activeEvent.registeredUsers.push(user._id);
    await activeEvent.save();
    
    // Generate QR code
    const qrCodeData = await generateQRCode(phone);
    
    res.status(201).json({
      success: true,
      data: {
        user,
        event: activeEvent,
        qrCode: qrCodeData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
};

/**
 * @desc    Get user by phone number
 * @route   GET /api/users/phone/:phone
 * @access  Public
 */
exports.getUserByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Find user by phone
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get active event
    const activeEvent = await Event.findOne({ isActive: true });
    
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Check if user is registered for active event
    const isRegistered = user.registeredEvents.includes(activeEvent._id);
    
    if (!isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'User is not registered for the active event'
      });
    }
    
    // Generate QR code
    const qrCodeData = await generateQRCode(phone);
    
    res.status(200).json({
      success: true,
      data: {
        user,
        event: activeEvent,
        qrCode: qrCodeData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

/**
 * @desc    Get all registered users
 * @route   GET /api/users
 * @access  Private (admin & authenticator)
 */
exports.getUsers = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { gender, address, isCheckedIn, registrationMethod } = req.query;
    
    // Build query
    const query = {};
    
    if (gender) query.gender = gender;
    if (address) query.address = { $regex: address, $options: 'i' };
    if (registrationMethod) query.registrationMethod = registrationMethod;
    
    // Get active event for checked-in filtering
    const activeEvent = await Event.findOne({ isActive: true });
    
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Get all users matching query
    let users = await User.find(query).sort({ createdAt: -1 });
    
    // Filter by check-in status if requested
    if (isCheckedIn === 'true' || isCheckedIn === 'false') {
      const checkedIn = isCheckedIn === 'true';
      
      users = users.filter(user => {
        const hasCheckIn = user.checkIns.some(checkIn => 
          checkIn.event.toString() === activeEvent._id.toString()
        );
        
        return checkedIn ? hasCheckIn : !hasCheckIn;
      });
    }
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

/**
 * @desc    Register user on-spot by authenticator
 * @route   POST /api/users/onspot
 * @access  Private (admin & authenticator)
 */
exports.registerOnSpot = async (req, res) => {
  try {
    const { name, phone, gender, address, isNamdharak } = req.body;
    
    // Get active event
    const activeEvent = await Event.findOne({ isActive: true });
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Check if user with phone already exists
    let user = await User.findOne({ phone });
    
    if (user) {
      // Check if user is already registered for this event
      const alreadyRegistered = user.registeredEvents.includes(activeEvent._id);
      
      if (alreadyRegistered) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered for this event',
          isRegistered: true,
          userId: user._id
        });
      }
      
      // Update existing user and add this event
      user.registeredEvents.push(activeEvent._id);
      user.registrationMethod = 'on-spot';
      user.registeredBy = req.admin.id;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        phone,
        gender,
        address,
        isNamdharak: isNamdharak || false,
        registeredEvents: [activeEvent._id],
        registrationMethod: 'on-spot',
        registeredBy: req.admin.id
      });
    }
    
    // Update event with registered user
    activeEvent.registeredUsers.push(user._id);
    await activeEvent.save();
    
    // Generate QR code
    const qrCodeData = await generateQRCode(phone);
    
    // Add check-in record immediately
    user.checkIns.push({
      event: activeEvent._id,
      authenticatedBy: req.admin.id
    });
    await user.save();
    
    // Update event checked-in users
    if (!activeEvent.checkedInUsers.includes(user._id)) {
      activeEvent.checkedInUsers.push(user._id);
      await activeEvent.save();
    }
    
    res.status(201).json({
      success: true,
      data: {
        user,
        event: activeEvent,
        qrCode: qrCodeData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user on-spot',
      error: error.message
    });
  }
};

/**
 * @desc    Check-in user by phone or QR code
 * @route   POST /api/users/checkin
 * @access  Private (admin & authenticator)
 */
exports.checkInUser = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Find user by phone
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get active event
    const activeEvent = await Event.findOne({ isActive: true });
    
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Check if user is registered for active event
    const isRegistered = user.registeredEvents.some(
      eventId => eventId.toString() === activeEvent._id.toString()
    );
    
    if (!isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'User is not registered for the active event'
      });
    }
    
    // Check if user is already checked in
    const alreadyCheckedIn = user.checkIns.some(
      checkIn => checkIn.event.toString() === activeEvent._id.toString()
    );
    
    if (alreadyCheckedIn) {
      return res.status(400).json({
        success: false,
        message: 'User is already checked in for this event'
      });
    }
    
    // Add check-in record
    user.checkIns.push({
      event: activeEvent._id,
      authenticatedBy: req.admin.id
    });
    await user.save();
    
    // Update event checked-in users
    activeEvent.checkedInUsers.push(user._id);
    await activeEvent.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check-in user',
      error: error.message
    });
  }
};