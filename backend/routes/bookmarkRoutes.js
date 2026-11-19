const express = require('express');
const router = express.Router();
const {
  bookmarkPost,
  removeBookmark,
  getUserBookmarks,
  checkBookmark,
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

// Bookmark routes
router.post('/:postId/bookmark', protect, bookmarkPost);
router.delete('/:postId/bookmark', protect, removeBookmark);
router.get('/:postId/bookmark/check', protect, checkBookmark);

// Get user's bookmarks
router.get('/bookmarks', protect, getUserBookmarks);

module.exports = router;

