const mongoose = require('mongoose');

const downloadedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  song: {
    id: String,
    title: String,
    artist: String,
    album: String,
    imageUrl: String,
  },
});

module.exports = mongoose.model('Downloaded', downloadedSchema);