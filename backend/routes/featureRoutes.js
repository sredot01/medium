const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  featurePost,
  unfeaturePost,
  getFeaturedPosts,
  checkFeatured,
} = require('../controllers/featureController');

// Get all featured posts (public)
router.get('/featured', getFeaturedPosts);

// Check if post is featured (public)
router.get('/:postId/featured/check', checkFeatured);

// Feature a post (protected)
router.post('/:postId/featured', protect, featurePost);

// Unfeature a post (protected)
router.delete('/:postId/featured', protect, unfeaturePost);

module.exports = router;

