const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');

// Get all posts
exports.getAllPosts = (req, res, next) => {
  try {
    const { category, tag, author, search, sortBy = 'createdAt', order = 'DESC' } = req.query;
    
    const posts = Post.findAll({
      category,
      tag,
      author,
      search,
      sortBy,
      order,
    });

    // Add like and comment counts
    const postsWithCounts = posts.map(post => ({
      ...post,
      likeCount: Like.getPostLikesCount(post.id),
      commentCount: Comment.getPostCommentsCount(post.id),
    }));

    res.json({
      success: true,
      count: postsWithCounts.length,
      data: postsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// Get post by ID with counts
exports.getPostById = (req, res, next) => {
  try {
    const post = Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Add counts
    const postWithCounts = {
      ...post,
      likeCount: Like.getPostLikesCount(post.id),
      commentCount: Comment.getPostCommentsCount(post.id),
    };

    res.json({
      success: true,
      data: postWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// Get post by slug with counts
exports.getPostBySlug = (req, res, next) => {
  try {
    const post = Post.findBySlug(req.params.slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Add counts
    const postWithCounts = {
      ...post,
      likeCount: Like.getPostLikesCount(post.id),
      commentCount: Comment.getPostCommentsCount(post.id),
    };

    res.json({
      success: true,
      data: postWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// Create new post
exports.createPost = (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, coverImage } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content',
      });
    }

    // If user is authenticated, use their info
    let author = req.body.author || 'Anonymous';
    let userId = null;

    if (req.user) {
      author = req.user.name;
      userId = req.user.id;
    }

    const post = Post.create({
      title,
      content,
      excerpt,
      author,
      userId,
      category,
      tags,
      coverImage,
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// Update post
exports.updatePost = (req, res, next) => {
  try {
    const existingPost = Post.findById(req.params.id);

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (existingPost.userId && existingPost.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    const post = Post.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// Delete post
exports.deletePost = (req, res, next) => {
  try {
    const existingPost = Post.findById(req.params.id);

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (existingPost.userId && existingPost.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    Post.delete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all unique authors
exports.getAllAuthors = (req, res, next) => {
  try {
    const authors = Post.getAllAuthors();

    res.json({
      success: true,
      count: authors.length,
      data: authors,
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories
exports.getAllCategories = (req, res, next) => {
  try {
    const categories = Post.getAllCategories();

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// Get all tags
exports.getAllTags = (req, res, next) => {
  try {
    const tags = Post.getAllTags();

    res.json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    next(error);
  }
};

// Health check
exports.healthCheck = (req, res) => {
  res.json({
    success: true,
    message: 'TechBlog API is running',
    timestamp: new Date().toISOString(),
  });
};
