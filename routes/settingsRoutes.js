const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getSetting } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all settings for current user
router.get('/', authMiddleware, getSettings);

// Update settings for current user
router.put('/', authMiddleware, updateSettings);

// Get specific setting
router.get('/:key', authMiddleware, getSetting);

module.exports = router;
