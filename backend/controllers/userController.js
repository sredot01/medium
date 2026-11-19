const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');

// @desc    Get user profile
// @route   GET /api/users/:userId
// @access  Public
exports.getUserProfile = (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const safeUser = User.getSafeUser(user);

    // Get user stats
    const posts = Post.findAll({ userId });
    const followerCount = Follow.getFollowerCount(userId);
    const followingCount = Follow.getFollowingCount(userId);

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = Follow.isFollowing(req.user.id, userId);
    }

    res.json({
      success: true,
      data: {
        ...safeUser,
        postCount: posts.length,
        followerCount,
        followingCount,
        isFollowing,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's posts
// @route   GET /api/users/:userId/posts
// @access  Public
exports.getUserPosts = (req, res, next) => {
  try {
    const { userId } = req.params;

    const posts = Post.findAll({ userId });

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

