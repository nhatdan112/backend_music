const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  song: { type: Object, required: true }, // Hoặc định nghĩa chi tiết hơn
});

module.exports = mongoose.model('Favorite', favoriteSchema);