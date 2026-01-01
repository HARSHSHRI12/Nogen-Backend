const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.post('/:postId/like', postController.toggleLike);
router.post('/:postId/comment', postController.addComment);
router.delete('/:postId', postController.deletePost);

module.exports = router;
