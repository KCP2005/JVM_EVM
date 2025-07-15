const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['M', 'F', 'O'],
    required: [true, 'Gender is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  isNamdharak: {
    type: Boolean,
    default: false
  },
  registeredEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }],
  checkIns: [{
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    authenticatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
  registeredBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    default: null // null means self-registered
  },
  registrationMethod: {
    type: String,
    enum: ['self', 'on-spot', 'admin'],
    default: 'self'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for phone number for faster lookups
userSchema.index({ phone: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;