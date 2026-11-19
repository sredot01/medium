const express = require('express');
const router = express.Router();
const { getUserProfile, getUserPosts } = require('../controllers/userController');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
} = require('../controllers/followController');
const { protect, optionalAuth } = require('../middleware/auth');

// User profile routes
router.get('/:userId', optionalAuth, getUserProfile);
router.get('/:userId/posts', getUserPosts);

// Follow routes
router.post('/:userId/follow', protect, followUser);
router.delete('/:userId/follow', protect, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/:userId/is-following', protect, checkFollowing);

module.exports = router;

