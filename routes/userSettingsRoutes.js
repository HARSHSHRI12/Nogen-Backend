const express = require('express');
const { getSettings, updateSettings } = require('../controllers/userSettingsController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Get user settings
router.get('/:userId', protect, getSettings);

// Update user settings
router.put('/:userId', protect, updateSettings);

module.exports = router;
