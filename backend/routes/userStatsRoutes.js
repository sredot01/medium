const express = require('express');
const router = express.Router();
const {
  getUserStats,
  getUserPostStats,
  getUserStatsByDateRange,
} = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

// User stats routes
router.get('/:userId/stats', protect, getUserStats);
router.get('/:userId/stats/posts', protect, getUserPostStats);
router.get('/:userId/stats/range', protect, getUserStatsByDateRange);

module.exports = router;

