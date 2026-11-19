const express = require('express');
const router = express.Router();
const { getAllCategories, getAllTags } = require('../controllers/postController');

// Category and tag routes
router.get('/categories', getAllCategories);
router.get('/tags', getAllTags);

module.exports = router;

