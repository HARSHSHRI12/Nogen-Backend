const Question = require('../models/Question');

// Get all or filtered questions
exports.getAllQuestions = async (req, res) => {
  try {
    const { difficulty, topic } = req.query;
    let query = {};

    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topics = { $in: [topic] };

    const questions = await Question.find(query);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark question as solved
exports.updateQuestionStatus = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Not found' });

    question.solved = true;
    await question.save();

    res.json({ message: 'Marked as solved', question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
