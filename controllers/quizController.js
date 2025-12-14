const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

// Submit quiz result
exports.submitQuizResult = async (req, res) => {
  try {
    // 1. Save quiz result in QuizResult collection
    const newResult = new QuizResult(req.body);
    await newResult.save();

    // 2. Update the user's quiz history and progress
    const user = await User.findById(req.body.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find out weak topics (based on incorrect answers)
    const weakTopics = req.body.topics.filter(topic => 
      !req.body.correctTopics.includes(topic)
    );

    // Update user quiz history with results and weak topics
    user.quizHistory.push({
      quizResultId: newResult._id,
      subject: req.body.subject,
      score: req.body.score,
      totalQuestions: req.body.totalQuestions,
      progress: Math.round((req.body.score / req.body.totalQuestions) * 100),
      weakTopics,
      completedAt: new Date(),
    });

    // Update user's progress map based on score and topics
    req.body.topics.forEach((topic) => {
      const currentProgress = user.progress.get(topic) || 0;
      const updatedProgress = Math.max(
        currentProgress, 
        Math.round((req.body.score / req.body.totalQuestions) * 100)
      );
      user.progress.set(topic, updatedProgress);
    });

    // Save the updated user document
    await user.save();

    res.status(201).json({ success: true, message: 'Result saved and user progress updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get user quiz history
exports.getUserQuizHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const results = await QuizResult.find({ userId }).sort({ date: -1 });

    // Fetch user and their quiz progress map
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const progress = user.progress;

    res.status(200).json({
      success: true,
      data: results,
      progress: Object.fromEntries(progress), // Convert Map to object for easy response
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
