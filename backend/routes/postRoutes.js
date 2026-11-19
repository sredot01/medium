const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getAllAuthors,
} = require('../controllers/postController');
const { optionalAuth, protect } = require('../middleware/auth');

// Authors route (must be before /:id to avoid conflicts)
router.get('/authors/all', getAllAuthors);

// Slug route (must be before /:id to avoid conflicts)
router.get('/slug/:slug', getPostBySlug);

// Post routes
router.route('/')
  .get(getAllPosts)
  .post(optionalAuth, createPost); // Optional auth - can post as guest or authenticated user

router.route('/:id')
  .get(getPostById)
  .put(protect, updatePost) // Protected - must be authenticated
  .delete(protect, deletePost); // Protected - must be authenticated

module.exports = router;
