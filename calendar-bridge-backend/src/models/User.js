const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  tokens: {
    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
      required: true,
    },
    expiry_date: {
      type: Number,
      required: true,
    },
  },
  apiKey: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate API key when a new user is created
UserSchema.pre('save', function(next) {
  if (this.isNew && !this.apiKey) {
    this.apiKey = crypto.randomBytes(20).toString('hex');
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);