const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Favorite = require('../models/favorite');
const Downloaded = require('../models/downloaded');
const Playlist = require('../models/playlist');
const axios = require('axios');
const ytdl = require('ytdl-core');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');

// Khởi tạo cache
const cache = new NodeCache({ stdTTL: 3600 }); // Cache trong 1 giờ

// Định nghĩa rate limiter


// Tìm kiếm video YouTube
router.get('/youtube/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 1,
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    const video = response.data.items[0];
    if (!video) {
      return res.status(404).json({ error: 'No video found' });
    }

    res.json({
      videoId: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.default.url,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search YouTube: ' + error.message });
  }
});


// Thêm bài hát vào danh sách yêu thích
router.post('/favorites', authMiddleware, async (req, res) => {
  try {
    const { song } = req.body;
    const favorite = new Favorite({ userId: req.user.userId, song });
    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

// Lấy danh sách yêu thích
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.userId });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Thêm bài hát đã tải
router.post('/downloaded', authMiddleware, async (req, res) => {
  try {
    const { fileName, song } = req.body;
    const downloaded = new Downloaded({ userId: req.user.userId, fileName, song });
    await downloaded.save();
    res.status(201).json(downloaded);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save downloaded song' });
  }
});

// Lấy danh sách bài hát đã tải
router.get('/downloaded', authMiddleware, async (req, res) => {
  try {
    const downloaded = await Downloaded.find({ userId: req.user.userId });
    res.json(downloaded);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch downloaded songs' });
  }
});

// Xóa bài hát khỏi danh sách yêu thích
router.delete('/favorites/:id', authMiddleware, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Favorite deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

// Tạo playlist
router.post('/playlists', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const playlist = new Playlist({ userId: req.user.userId, name, songs: [] });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Lấy danh sách playlists
router.get('/playlists', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.userId });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Thêm bài hát vào playlist
router.post('/playlists/:id/songs', authMiddleware, async (req, res) => {
  try {
    const { song } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    playlist.songs.push(song);
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add song to playlist' });
  }
});

// Xóa playlist
router.delete('/playlists/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.status(200).json({ message: 'Playlist deleted' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

module.exports = router;
