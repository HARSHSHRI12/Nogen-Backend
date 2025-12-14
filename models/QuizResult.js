const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Correct reference type
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  topics: {
    type: [String],
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  weakTopics: {
    type: [String], // Automatically calculated on backend from incorrect answers
    default: [],
  },
  improvementTips: {
    type: String, // e.g., "Revise loops and conditionals in JavaScript"
    default: '',
  },
  progressPercentage: {
    type: Number, // (score / totalQuestions) * 100
    default: 0,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
