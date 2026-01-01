const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/messages/:otherUserId', chatController.getMessages);
router.put('/read/:otherUserId', chatController.markAsRead);

module.exports = router;
