const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    select: false //  SECURITY
  },

  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student'
  },

  avatar: {
    type: String
  },

  // Student specific
  grade: {
    type: String
  },

  // Teacher specific
  subjects: [{
    type: String
  }],
  institution: {
    type: String
  },

  // Progress tracking
  progress: {
    type: Map,
    of: Number,
    default: {}
  },

  // Quiz history
  quizHistory: [
    {
      quizResultId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizResult'
      },
      subject: String,
      score: Number,
      totalQuestions: Number,
      progress: Number,
      weakTopics: [String],
      completedAt: Date
    }
  ],

  // Refresh token (for rotation)
  refreshToken: {
    type: String,
    select: false
  },

  // Reset password
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }

}, { timestamps: true });

//  Safe export
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
