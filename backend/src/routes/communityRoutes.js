const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  uploadMeme,
  getMemeById,
  reactToMeme,
  getTrendingMemes
} = require('../controllers/communityController');

// Public routes
router.get('/trending', getTrendingMemes);
router.get('/:id', getMemeById);

// Protected routes
router.post('/upload', protect, uploadMeme);
router.post('/:id/react', protect, reactToMeme);

module.exports = router;
