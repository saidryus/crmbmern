const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Admin model
 * Stores staff login credentials. Passwords are hashed with bcrypt
 * before saving — plain-text passwords are never stored in the DB.
 */
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if it was modified
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method — compare a plain-text password against the stored hash
adminSchema.methods.matchPassword = async function (plainText) {
  return bcrypt.compare(plainText, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
