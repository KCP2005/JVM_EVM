const QRCode = require('qrcode');

/**
 * Generate QR code as data URL
 * @param {string} data - Data to encode in QR code (typically phone number)
 * @returns {Promise<string>} - QR code as data URL
 */
exports.generateQRCode = async (data) => {
  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code as SVG string
 * @param {string} data - Data to encode in QR code
 * @returns {Promise<string>} - QR code as SVG string
 */
exports.generateQRCodeSVG = async (data) => {
  try {
    // Generate QR code as SVG string
    const qrCodeSVG = await QRCode.toString(data, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return qrCodeSVG;
  } catch (error) {
    console.error('QR Code SVG generation error:', error);
    throw new Error('Failed to generate QR code SVG');
  }
};