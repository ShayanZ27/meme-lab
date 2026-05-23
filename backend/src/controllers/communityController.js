const CommunityMeme = require('../models/CommunityMeme');

// @desc    Upload a new meme to the community
// @route   POST /api/community/upload
// @access  Private
const uploadMeme = async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'Please provide meme image data' });
    }

    const meme = await CommunityMeme.create({
      creator: req.user._id,
      imageData
    });

    res.status(201).json({ success: true, memeId: meme._id });
  } catch (error) {
    console.error('Error uploading meme:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
};

// @desc    Get meme by ID
// @route   GET /api/community/:id
// @access  Public
const getMemeById = async (req, res) => {
  try {
    const meme = await CommunityMeme.findById(req.params.id).populate('creator', 'username');
    
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    res.json({ meme });
  } catch (error) {
    console.error('Error fetching meme:', error);
    res.status(500).json({ error: 'Server error fetching meme' });
  }
};

// @desc    React to a meme (like/dislike)
// @route   POST /api/community/:id/react
// @access  Private
const reactToMeme = async (req, res) => {
  try {
    const { reactionType } = req.body; // 'like' or 'dislike'
    const memeId = req.params.id;
    const userId = req.user._id;

    if (!['like', 'dislike'].includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const meme = await CommunityMeme.findById(memeId);
    
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    // Remove user from both arrays first to reset
    meme.likes = meme.likes.filter(id => id.toString() !== userId.toString());
    meme.dislikes = meme.dislikes.filter(id => id.toString() !== userId.toString());

    // Add to appropriate array
    if (reactionType === 'like') {
      meme.likes.push(userId);
    } else if (reactionType === 'dislike') {
      meme.dislikes.push(userId);
    }

    await meme.save();

    res.json({ likes: meme.likes.length, dislikes: meme.dislikes.length });
  } catch (error) {
    console.error('Error reacting to meme:', error);
    res.status(500).json({ error: 'Server error reacting to meme' });
  }
};

// @desc    Get trending/leaderboard memes
// @route   GET /api/community/trending
// @access  Public
const getTrendingMemes = async (req, res) => {
  try {
    const { timeframe } = req.query; // 'today', 'week', 'month', 'all_time'
    
    let dateQuery = {};
    const now = new Date();
    
    if (timeframe === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateQuery = { createdAt: { $gte: today } };
    } else if (timeframe === 'week') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateQuery = { createdAt: { $gte: lastWeek } };
    } else if (timeframe === 'month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      dateQuery = { createdAt: { $gte: lastMonth } };
    }

    const memes = await CommunityMeme.aggregate([
      { $match: dateQuery },
      { 
        $addFields: { 
          likeCount: { $size: "$likes" } 
        } 
      },
      { $sort: { likeCount: -1, createdAt: -1 } },
      { $limit: 50 }
    ]);

    await CommunityMeme.populate(memes, { path: 'creator', select: 'username' });

    res.json({ memes });
  } catch (error) {
    console.error('Error fetching trending memes:', error);
    res.status(500).json({ error: 'Server error fetching trending memes' });
  }
};

module.exports = {
  uploadMeme,
  getMemeById,
  reactToMeme,
  getTrendingMemes
};
