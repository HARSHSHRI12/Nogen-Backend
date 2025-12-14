const express = require('express');
const router = express.Router();
const { submitQuizResult, getUserQuizHistory } = require('../controllers/quizController');

router.post('/submit', submitQuizResult); // /api/quiz/submit
router.get('/history/:userId', getUserQuizHistory); // /api/quiz/history/<userId>

module.exports = router;
