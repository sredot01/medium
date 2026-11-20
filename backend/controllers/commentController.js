const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { getDB, saveDatabase } = require('../config/database');

// @desc    Create comment
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.createComment = (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body ?? {};
    const userId = req.user.id;

    if (typeof content !== 'string' || !content.trim() || content.length > 4000) {
      return res.status(400).json({
        success: false,
        message: 'Enter a comment of up to 4,000 characters.',
      });
    }

    if (!Post.findById(postId)) return res.status(404).json({ message: 'Post not found.' });
    if (parentId != null) {
      const parent = typeof parentId === 'string' ? Comment.findById(parentId) : null;
      if (!parent || parent.postId !== postId) {
        return res.status(400).json({ message: 'This reply must belong to a comment on the same post.' });
      }
    }

    const comment = Comment.create({
      parentId,
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

    const comments = Comment.getPostComments(postId, req.user?.id);
    const count = Comment.getPostCommentsCount(postId);

    res.set('Cache-Control', 'no-store');
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


exports.setCommentLike = (req, res) => {
  const { id } = req.params;
  if (!Comment.findById(id)) return res.status(404).json({ message: 'Comment not found.' });
  const db = getDB();
  if (req.method === 'PUT') {
    db.run('INSERT OR IGNORE INTO comment_likes VALUES (?, ?, ?)', [id, req.user.id, new Date().toISOString()]);
  } else {
    db.run('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?', [id, req.user.id]);
  }
  saveDatabase();
  return res.sendStatus(204);
};
