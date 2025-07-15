import html2canvas from 'html2canvas';

/**
 * Generate a downloadable image from a QR code card element
 * @param {string} elementId - ID of the element to capture
 * @param {string} filename - Name for the downloaded file
 */
export const downloadQRCard = async (elementId, filename = 'event-qr-card.png') => {
  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error('Element not found');
    }
    
    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error generating QR card image:', error);
    return false;
  }
};

/**
 * Parse QR code data
 * @param {string} data - QR code data (typically phone number)
 * @returns {string} - Parsed phone number
 */
export const parseQRData = (data) => {
  // In this simple implementation, QR data is just the phone number
  // You can extend this for more complex data formats if needed
  return data.trim();
};