const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
// DEPRECATED: Handled in profileRoutes.js and uploadRoutes.js
// router.get('/profile', authMiddleware, userController.getProfile);
// router.put('/profile', authMiddleware, userController.updateProfile);
// router.post('/profile/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

// @route   GET /api/user/notes
// @desc    Get user generated notes (for students)
// @access  Private (student only)
router.get('/notes', authMiddleware, userController.getUserNotes);

// @route   GET /api/user/classes
// @desc    Get teacher's classes (for teachers)
// @access  Private (teacher only)
router.get('/classes', authMiddleware, userController.getTeacherClasses);

module.exports = router;