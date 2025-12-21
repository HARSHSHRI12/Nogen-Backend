const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'achievement'],
    default: 'info',
  },
  icon: {
    type: String,
    default: 'ℹ️',
  },
  link: {
    type: String,
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000, // Auto delete after 30 days
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
