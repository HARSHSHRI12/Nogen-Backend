const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher'], required: true },
  avatar: { type: String },
  
  // Student specific fields
  grade: { type: String },

  // Teacher specific fields
  subjects: [{ type: String }],
  institution: { type: String },

  // Progress tracking
  progress: {
    type: Map,
    of: Number,
    default: {},
  },

  // Quiz History for analytics
  quizHistory: [
    {
      quizResultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult' },
      subject: String,
      score: Number,
      totalQuestions: Number,
      progress: Number,
      weakTopics: [String],
      completedAt: Date
    }
  ],

  // Reset password
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }

}, { timestamps: true });

// ✅ Safe export (no OverwriteModelError)
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
