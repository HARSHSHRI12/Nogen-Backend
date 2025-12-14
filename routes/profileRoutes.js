// ProfileRoutes.js
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');  // Middleware for user authentication

// Get Profile Data
router.get('/me', authMiddleware, getProfile);

// Update Profile Data
router.put('/', authMiddleware, updateProfile);

module.exports = router;
