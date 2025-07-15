const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for authentication
 * @param {string} id - Admin ID to include in token
 * @returns {string} - JWT token
 */
exports.generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Create and send token response
 * @param {object} admin - Admin user object
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 */
exports.sendTokenResponse = (admin, statusCode, res) => {
  // Create token
  const token = this.generateToken(admin._id);
  
  // Remove password from output
  admin.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    token,
    data: admin
  });
};