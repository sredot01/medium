const express = require('express');
const router = express.Router();
const { likePost, unlikePost, getPostLikes } = require('../controllers/likeController');
const { protect, optionalAuth } = require('../middleware/auth');

// Like routes
router.post('/:postId/like', protect, likePost);
router.delete('/:postId/like', protect, unlikePost);
router.get('/:postId/likes', optionalAuth, getPostLikes);

module.exports = router;

