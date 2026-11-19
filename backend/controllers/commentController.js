const Comment = require('../models/Comment');

// @desc    Create comment
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.createComment = (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const comment = Comment.create({
      userId,
      postId,
      content: content.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get post comments
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getPostComments = (req, res, next) => {
  try {
    const { postId } = req.params;

    const comments = Comment.getPostComments(postId);
    const count = Comment.getPostCommentsCount(postId);

    res.json({
      success: true,
      data: {
        comments,
        count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user owns the comment
    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const updatedComment = Comment.update(id, content.trim());

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user owns the comment
    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    Comment.delete(id);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

