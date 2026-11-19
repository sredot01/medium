const express = require('express');
const router = express.Router();
const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// Comment routes for posts
router.post('/:postId/comments', protect, createComment);
router.get('/:postId/comments', getPostComments);

// Individual comment routes
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);

module.exports = router;

