const express = require('express');
const router = express.Router();
const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  setCommentLike,
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');

// Comment routes for posts
router.post('/:postId/comments', protect, createComment);
router.get('/:postId/comments', optionalAuth, getPostComments);
router.route('/comments/:id/like').put(protect, setCommentLike).delete(protect, setCommentLike);

// Individual comment routes
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);

module.exports = router;

