
const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  course: String,
  subject: String,
  topic: String,
  year: String,
  depth: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
