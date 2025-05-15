const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  songs: [{
    id: String,
    title: String,
    artist: String,
    album: String,
    imageUrl: String,
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Playlist', playlistSchema);