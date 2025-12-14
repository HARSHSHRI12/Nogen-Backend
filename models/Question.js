const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  topics: [String],
  companies: [String],
  boilerplate: {
    javascript: String,
    python: String,
    cpp: String
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [{
    input: String,
    output: String
  }],
  solved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
