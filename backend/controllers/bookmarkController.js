const Bookmark = require('../models/Bookmark');

// @desc    Bookmark a post
// @route   POST /api/posts/:postId/bookmark
// @access  Private
exports.bookmarkPost = (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const bookmark = Bookmark.create(userId, postId);

    res.status(201).json({
      success: true,
      message: 'Post bookmarked successfully',
      data: bookmark,
    });
  } catch (error) {
    if (error.message === 'Post already bookmarked') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/posts/:postId/bookmark
// @access  Private
exports.removeBookmark = (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    Bookmark.delete(userId, postId);

    res.json({
      success: true,
      message: 'Bookmark removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarks
// @route   GET /api/posts/bookmarks
// @access  Private
exports.getUserBookmarks = (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log('Fetching bookmarks for user:', userId);

    const bookmarks = Bookmark.getUserBookmarks(userId);
    console.log('Found bookmarks:', bookmarks.length);
    console.log('Bookmarks data:', JSON.stringify(bookmarks, null, 2));

    res.json({
      success: true,
      count: bookmarks.length,
      data: bookmarks,
    });
  } catch (error) {
    console.error('Error in getUserBookmarks controller:', error);
    next(error);
  }
};

// @desc    Check if post is bookmarked
// @route   GET /api/posts/:postId/bookmark/check
// @access  Private
exports.checkBookmark = (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const isBookmarked = Bookmark.hasBookmarked(userId, postId);

    res.json({
      success: true,
      data: { isBookmarked },
    });
  } catch (error) {
    next(error);
  }
};

