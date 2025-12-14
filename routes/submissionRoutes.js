const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middleware/authMiddleware');
const studentMiddleware = require('../middleware/studentMiddleware');
const upload = require('../config/multer');

// @route   POST /api/submit/assignment/:id
// @desc    Submit assignment (student)
// @access  Private (student)
router.post('/assignment/:id', authMiddleware, studentMiddleware, upload.single('submission'), submissionController.submitAssignment);

// @route   GET /api/submit/assignments
// @desc    Get student's assignments (student)
// @access  Private (student)
router.get('/assignments', authMiddleware, studentMiddleware, submissionController.getAssignments);

// @route   GET /api/submit/assignment/:id
// @desc    Get assignment details (student)
// @access  Private (student)
router.get('/assignment/:id', authMiddleware, studentMiddleware, submissionController.getAssignment);

module.exports = router;