const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/notes', authMiddleware, userController.getUserNotes);
router.get('/classes', authMiddleware, userController.getTeacherClasses);

// THIS MUST BE LAST
router.get('/:userId', authMiddleware, userController.getUserById);

module.exports = router;