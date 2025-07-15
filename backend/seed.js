require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/admin.model');
const Event = require('./models/event.model');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-registration';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a sample banner image
const createSampleBanner = () => {
  const bannerPath = path.join(uploadsDir, 'sample-banner.jpg');
  
  // Check if the file already exists
  if (!fs.existsSync(bannerPath)) {
    // Create a simple text file as a placeholder
    fs.writeFileSync(bannerPath, 'This is a placeholder for a banner image');
  }
  
  return '/uploads/sample-banner.jpg';
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Admin.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Created admin user:', admin.email);
    
    // Create sample event
    const bannerPath = createSampleBanner();
    const event = await Event.create({
      name: 'Sample Event',
      description: 'This is a sample event for testing purposes',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      venue: 'Sample Venue',
      time: '10:00 AM - 5:00 PM',
      bannerImage: bannerPath,
      isActive: true,
      createdBy: admin._id
    });
    console.log('Created sample event:', event.name);
    
    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();