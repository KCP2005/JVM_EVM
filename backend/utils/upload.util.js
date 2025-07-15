const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
console.log('Upload directory path:', uploadDir);
if (!fs.existsSync(uploadDir)) {
  console.log('Creating upload directory as it does not exist');
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Upload directory created successfully');
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
} else {
  console.log('Upload directory exists');
  // Check if directory is writable
  try {
    fs.accessSync(uploadDir, fs.constants.W_OK);
    console.log('Upload directory is writable');
  } catch (error) {
    console.error('Upload directory is not writable:', error);
  }
}

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create multer upload instance with error handling
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('banner');

// Create a wrapper function to handle errors properly
const uploadWithErrorHandling = (req, res, next) => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        console.error('Multer upload error:', err);
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          console.error('Multer specific error:', err.code);
          if (err.code === 'LIMIT_FILE_SIZE') {
            return reject(new Error('File is too large. Maximum size is 5MB'));
          }
          return reject(new Error(`Multer upload error: ${err.message}`));
        } else {
          // An unknown error occurred
          return reject(err);
        }
      }
      
      // Check if file exists
      if (!req.file) {
        console.error('No file received in the request');
        return reject(new Error('Please upload a file'));
      }
      
      console.log('File uploaded successfully:', req.file);
      resolve(req.file);
    });
  });
};

module.exports = {
  single: upload,
  uploadWithErrorHandling
};