const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, userController.getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, userController.updateProfile);

// @route   POST /api/user/profile/avatar
// @desc    Upload profile avatar
// @access  Private
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

// @route   GET /api/user/notes
// @desc    Get user generated notes (for students)
// @access  Private (student only)
router.get('/notes', authMiddleware, userController.getUserNotes);

// @route   GET /api/user/classes
// @desc    Get teacher's classes (for teachers)
// @access  Private (teacher only)
router.get('/classes', authMiddleware, userController.getTeacherClasses);

module.exports = router;