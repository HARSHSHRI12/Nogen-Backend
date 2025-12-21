const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user should have only one settings document
  },
  settings: {
    type: Object,
    default: {
      theme: 'light', // 'light', 'dark', 'system'
      soundEffects: true,
      textStyle: 'default', // e.g., 'default', 'serif', 'monospace'
      fontSize: 'medium', // 'small', 'medium', 'large'
      notifications: {
        email: true,
        inApp: true,
      },
      // Add more advanced settings as needed
    },
  },
}, { timestamps: true });

module.exports = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
