// models/mapping.js
const mongoose = require('mongoose');

const mappingSchema = new mongoose.Schema({
  spotify_track_id: { type: String, required: true, unique: true },
  youtube_video_id: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mapping', mappingSchema);