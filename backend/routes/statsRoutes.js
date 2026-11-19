const express = require('express');
const router = express.Router();
const {
  recordView,
  recordRead,
  getUserStats,
  getUserPostStats,
  getUserStatsByDateRange,
  getPostStats,
} = require('../controllers/statsController');
const { protect, optionalAuth } = require('../middleware/auth');

// Post view/read tracking
router.post('/:postId/view', optionalAuth, recordView);
router.post('/:postId/read', optionalAuth, recordRead);
router.get('/:postId/stats', getPostStats);

module.exports = router;

