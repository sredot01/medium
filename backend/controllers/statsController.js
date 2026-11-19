const Stats = require('../models/Stats');

// @desc    Record a view for a post
// @route   POST /api/posts/:postId/view
// @access  Public
exports.recordView = (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user.id : null;

    Stats.recordView(postId, userId);

    res.json({
      success: true,
      message: 'View recorded',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a read for a post
// @route   POST /api/posts/:postId/read
// @access  Public
exports.recordRead = (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user.id : null;

    Stats.recordRead(postId, userId);

    res.json({
      success: true,
      message: 'Read recorded',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's overall stats
// @route   GET /api/users/:userId/stats
// @access  Private
exports.getUserStats = (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own stats
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these stats',
      });
    }

    const stats = Stats.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed stats for user's posts
// @route   GET /api/users/:userId/stats/posts
// @access  Private
exports.getUserPostStats = (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own stats
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these stats',
      });
    }

    const postStats = Stats.getUserPostStats(userId);

    res.json({
      success: true,
      data: postStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stats by date range
// @route   GET /api/users/:userId/stats/range
// @access  Private
exports.getUserStatsByDateRange = (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if user is requesting their own stats
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these stats',
      });
    }

    const stats = Stats.getUserStatsByDateRange(userId, startDate, endDate);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get view/read counts for a post
// @route   GET /api/posts/:postId/stats
// @access  Public
exports.getPostStats = (req, res, next) => {
  try {
    const { postId } = req.params;

    const views = Stats.getViewCount(postId);
    const reads = Stats.getReadCount(postId);

    res.json({
      success: true,
      data: {
        views,
        reads,
      },
    });
  } catch (error) {
    next(error);
  }
};

