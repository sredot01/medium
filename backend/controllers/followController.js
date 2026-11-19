const Follow = require('../models/Follow');

// @desc    Follow a user
// @route   POST /api/users/:userId/follow
// @access  Private
exports.followUser = (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const follow = Follow.create(followerId, userId);

    res.status(201).json({
      success: true,
      message: 'User followed successfully',
      data: follow,
    });
  } catch (error) {
    if (error.message === 'Already following this user' || error.message === 'Cannot follow yourself') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:userId/follow
// @access  Private
exports.unfollowUser = (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    Follow.delete(followerId, userId);

    res.json({
      success: true,
      message: 'User unfollowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get followers of a user
// @route   GET /api/users/:userId/followers
// @access  Public
exports.getFollowers = (req, res, next) => {
  try {
    const { userId } = req.params;

    const followers = Follow.getFollowers(userId);
    const count = Follow.getFollowerCount(userId);

    res.json({
      success: true,
      data: {
        followers,
        count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users that a user is following
// @route   GET /api/users/:userId/following
// @access  Public
exports.getFollowing = (req, res, next) => {
  try {
    const { userId } = req.params;

    const following = Follow.getFollowing(userId);
    const count = Follow.getFollowingCount(userId);

    res.json({
      success: true,
      data: {
        following,
        count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if current user is following another user
// @route   GET /api/users/:userId/is-following
// @access  Private
exports.checkFollowing = (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const isFollowing = Follow.isFollowing(followerId, userId);

    res.json({
      success: true,
      data: { isFollowing },
    });
  } catch (error) {
    next(error);
  }
};

