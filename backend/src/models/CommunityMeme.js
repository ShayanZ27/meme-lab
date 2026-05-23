const mongoose = require('mongoose');

const communityMemeSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageData: {
    type: String,
    required: [true, 'Please provide the meme image data']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CommunityMeme = mongoose.model('CommunityMeme', communityMemeSchema);

module.exports = CommunityMeme;
