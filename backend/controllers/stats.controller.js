const User = require('../models/user.model');
const Event = require('../models/event.model');

/**
 * @desc    Get gender-wise statistics
 * @route   GET /api/stats/gender
 * @access  Private (admin only)
 */
exports.getGenderStats = async (req, res) => {
  try {
    // Get active event
    const activeEvent = await Event.findOne({ isActive: true });
    
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Get all users registered for active event
    const users = await User.find({
      registeredEvents: activeEvent._id
    });
    
    // Count by gender
    const maleCount = users.filter(user => user.gender === 'M').length;
    const femaleCount = users.filter(user => user.gender === 'F').length;
    const otherCount = users.filter(user => user.gender === 'O').length;
    
    // Calculate percentages
    const total = users.length;
    const malePercentage = total > 0 ? (maleCount / total) * 100 : 0;
    const femalePercentage = total > 0 ? (femaleCount / total) * 100 : 0;
    const otherPercentage = total > 0 ? (otherCount / total) * 100 : 0;
    
    res.status(200).json({
      success: true,
      data: {
        total,
        gender: {
          male: {
            count: maleCount,
            percentage: malePercentage.toFixed(2)
          },
          female: {
            count: femaleCount,
            percentage: femalePercentage.toFixed(2)
          },
          other: {
            count: otherCount,
            percentage: otherPercentage.toFixed(2)
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get gender statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get city-wise statistics
 * @route   GET /api/stats/city
 * @access  Private (admin only)
 */
exports.getCityStats = async (req, res) => {
  try {
    // Get active event
    const activeEvent = await Event.findOne({ isActive: true });
    
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Get all users registered for active event
    const users = await User.find({
      registeredEvents: activeEvent._id
    });
    
    // Group by city (address)
    const cityStats = {};
    
    users.forEach(user => {
      const city = user.address.trim();
      
      if (!cityStats[city]) {
        cityStats[city] = 1;
      } else {
        cityStats[city]++;
      }
    });
    
    // Convert to array and sort by count
    const sortedCityStats = Object.entries(cityStats)
      .map(([city, count]) => ({
        city,
        count,
        percentage: ((count / users.length) * 100).toFixed(2)
      }))
      .sort((a, b) => b.count - a.count);
    
    res.status(200).json({
      success: true,
      data: {
        total: users.length,
        cities: sortedCityStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get city statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get check-in time statistics
 * @route   GET /api/stats/checkin
 * @access  Private (admin only)
 */
exports.getCheckInStats = async (req, res) => {
  try {
    // Get active event
    const activeEvent = await Event.findOne({ isActive: true });
    
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Get all users with check-ins for active event
    const users = await User.find();
    
    // Filter check-ins for active event
    const checkIns = [];
    
    users.forEach(user => {
      user.checkIns.forEach(checkIn => {
        if (checkIn.event.toString() === activeEvent._id.toString()) {
          checkIns.push({
            userId: user._id,
            timestamp: checkIn.timestamp
          });
        }
      });
    });
    
    // Group check-ins by hour
    const hourlyStats = {};
    
    checkIns.forEach(checkIn => {
      const hour = new Date(checkIn.timestamp).getHours();
      const hourKey = `${hour}:00`;
      
      if (!hourlyStats[hourKey]) {
        hourlyStats[hourKey] = 1;
      } else {
        hourlyStats[hourKey]++;
      }
    });
    
    // Convert to array and sort by hour
    const sortedHourlyStats = Object.entries(hourlyStats)
      .map(([hour, count]) => ({
        hour,
        count,
        percentage: ((count / checkIns.length) * 100).toFixed(2)
      }))
      .sort((a, b) => {
        const hourA = parseInt(a.hour.split(':')[0]);
        const hourB = parseInt(b.hour.split(':')[0]);
        return hourA - hourB;
      });
    
    res.status(200).json({
      success: true,
      data: {
        total: checkIns.length,
        hourly: sortedHourlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get check-in statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get registration method statistics
 * @route   GET /api/stats/registration
 * @access  Private (admin only)
 */
exports.getRegistrationStats = async (req, res) => {
  try {
    // Get active event
    const activeEvent = await Event.findOne({ isActive: true });
    
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Get all users registered for active event
    const users = await User.find({
      registeredEvents: activeEvent._id
    });
    
    // Count by registration method
    const selfCount = users.filter(user => user.registrationMethod === 'self').length;
    const onSpotCount = users.filter(user => user.registrationMethod === 'on-spot').length;
    const adminCount = users.filter(user => user.registrationMethod === 'admin').length;
    
    // Calculate percentages
    const total = users.length;
    const selfPercentage = total > 0 ? (selfCount / total) * 100 : 0;
    const onSpotPercentage = total > 0 ? (onSpotCount / total) * 100 : 0;
    const adminPercentage = total > 0 ? (adminCount / total) * 100 : 0;
    
    res.status(200).json({
      success: true,
      data: {
        total,
        registrationMethod: {
          self: {
            count: selfCount,
            percentage: selfPercentage.toFixed(2)
          },
          onSpot: {
            count: onSpotCount,
            percentage: onSpotPercentage.toFixed(2)
          },
          admin: {
            count: adminCount,
            percentage: adminPercentage.toFixed(2)
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get registration statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/stats/dashboard
 * @access  Private (admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get active event
    const activeEvent = await Event.findOne({ isActive: true });
    
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        message: 'No active event found'
      });
    }
    
    // Get all users registered for active event
    const registeredUsers = await User.find({
      registeredEvents: activeEvent._id
    });
    
    // Count checked-in users
    const checkedInCount = activeEvent.checkedInUsers.length;
    
    // Calculate check-in percentage
    const totalRegistered = registeredUsers.length;
    const checkInPercentage = totalRegistered > 0 ? (checkedInCount / totalRegistered) * 100 : 0;
    
    // Count by gender
    const maleCount = registeredUsers.filter(user => user.gender === 'M').length;
    const femaleCount = registeredUsers.filter(user => user.gender === 'F').length;
    const otherCount = registeredUsers.filter(user => user.gender === 'O').length;
    
    // Count by registration method
    const selfCount = registeredUsers.filter(user => user.registrationMethod === 'self').length;
    const onSpotCount = registeredUsers.filter(user => user.registrationMethod === 'on-spot').length;
    const adminCount = registeredUsers.filter(user => user.registrationMethod === 'admin').length;
    
    // Count Namdharaks
    const namdharakCount = registeredUsers.filter(user => user.isNamdharak).length;
    
    res.status(200).json({
      success: true,
      data: {
        event: {
          name: activeEvent.name,
          date: activeEvent.date,
          venue: activeEvent.venue
        },
        registration: {
          total: totalRegistered,
          checkedIn: checkedInCount,
          checkInPercentage: checkInPercentage.toFixed(2),
          pending: totalRegistered - checkedInCount,
          namdharakCount: namdharakCount
        },
        gender: {
          male: maleCount,
          female: femaleCount,
          other: otherCount
        },
        registrationMethod: {
          self: selfCount,
          onSpot: onSpotCount,
          admin: adminCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
};