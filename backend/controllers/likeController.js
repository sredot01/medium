const Like = require('../models/Like');

// @desc    Like a post
// @route   POST /api/posts/:postId/like
// @access  Private
exports.likePost = (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const like = Like.create(userId, postId);

    res.status(201).json({
      success: true,
      message: 'Post liked successfully',
      data: like,
    });
  } catch (error) {
    if (error.message === 'Already liked') {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this post',
      });
    }
    next(error);
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:postId/like
// @access  Private
exports.unlikePost = (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    Like.delete(userId, postId);

    res.json({
      success: true,
      message: 'Post unliked successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get post likes
// @route   GET /api/posts/:postId/likes
// @access  Public
exports.getPostLikes = (req, res, next) => {
  try {
    const { postId } = req.params;

    const likes = Like.getPostLikes(postId);
    const count = Like.getPostLikesCount(postId);

    const hasLiked = req.user ? Like.hasUserLiked(req.user.id, postId) : false;

    res.json({
      success: true,
      data: {
        likes,
        count,
        hasLiked,
      },
    });
  } catch (error) {
    next(error);
  }
};

