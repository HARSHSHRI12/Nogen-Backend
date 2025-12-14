const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  solvedQuestions: [
    {
      questionId: String,
      status: String, // 'solved', 'in-progress', etc.
      timeTaken: Number, // Time taken to solve
    },
  ],
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
