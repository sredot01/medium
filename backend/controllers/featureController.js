const Post = require('../models/Post');

// Feature a post
exports.featurePost = (req, res, next) => {
  try {
    const { postId } = req.params;
    
    const post = Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const updatedPost = Post.featurePost(postId);
    
    res.json({
      success: true,
      message: 'Post featured successfully',
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// Unfeature a post
exports.unfeaturePost = (req, res, next) => {
  try {
    const { postId } = req.params;
    
    const post = Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const updatedPost = Post.unfeaturePost(postId);
    
    res.json({
      success: true,
      message: 'Post unfeatured successfully',
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// Get all featured posts
exports.getFeaturedPosts = (req, res, next) => {
  try {
    const featuredPosts = Post.getFeaturedPosts();
    
    res.json({
      success: true,
      count: featuredPosts.length,
      data: featuredPosts,
    });
  } catch (error) {
    next(error);
  }
};

// Check if post is featured
exports.checkFeatured = (req, res, next) => {
  try {
    const { postId } = req.params;
    
    const isFeatured = Post.isFeatured(postId);
    
    res.json({
      success: true,
      data: {
        isFeatured,
      },
    });
  } catch (error) {
    next(error);
  }
};

