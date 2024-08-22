const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  googleId: {
    type: String,
    required: false,
  },
  googleSignIn: {
    type: Boolean,
    default: false,
  },
  password: { type: String },
  displayName: { type: String },
  verificationCode: { type: String }, 
  isVerified: { type: Boolean, default: false },
  verificationCode2: {
    type: String,
  },
  verificationCode2Expires: {
    type: Date,
  },
});

const userMode = new mongoose.model('userMode', UserSchema);

module.exports = userMode;
