const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
// @route   POST /api/auth/register
// @desc    Register user (student/teacher)
// @access  Public
router.post('/signup', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('role', 'Role is required').isIn(['student', 'teacher'])
], authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], authController.login);

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', authMiddleware, authController.getMe);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;