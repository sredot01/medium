const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const postRoutes = require('./postRoutes');
const categoryRoutes = require('./categoryRoutes');
const likeRoutes = require('./likeRoutes');
const commentRoutes = require('./commentRoutes');
const userRoutes = require('./userRoutes');
const bookmarkRoutes = require('./bookmarkRoutes');
const featureRoutes = require('./featureRoutes');
const statsRoutes = require('./statsRoutes');
const userStatsRoutes = require('./userStatsRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TechBlog API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/posts', likeRoutes); // Like routes under /posts
router.use('/posts', commentRoutes); // Comment routes under /posts
router.use('/posts', bookmarkRoutes); // Bookmark routes under /posts
router.use('/posts', featureRoutes); // Feature routes under /posts
router.use('/posts', statsRoutes); // Stats routes under /posts
router.use('/users', userRoutes); // User and follow routes
router.use('/users', userStatsRoutes); // User stats routes under /users
router.use('/', categoryRoutes);

module.exports = router;
