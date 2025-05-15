const express = require('express');
       const router = express.Router();
       const bcrypt = require('bcryptjs');
       const jwt = require('jsonwebtoken');
       const User = require('../models/user');
       const { v4: uuidv4 } = require('uuid');

       router.post('/register', async (req, res) => {
         try {
           const { email, password } = req.body;
           if (!email || !password) {
             return res.status(400).json({ error: 'Email and password are required' });
           }
           const existingUser = await User.findOne({ email });
           if (existingUser) {
             return res.status(400).json({ error: 'Email already exists' });
           }

           const userId = uuidv4();
           const user = new User({
             email,
             password,
             userId,
           });
           await user.save();

           const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
             expiresIn: '1h',
           });
           res.status(201).json({ token, userId });
         } catch (error) {
           console.error('Register error:', error);
           res.status(500).json({ error: 'Failed to register' });
         }
       });

       router.post('/login', async (req, res) => {
         try {
           const { email, password } = req.body;
           if (!email || !password) {
             return res.status(400).json({ error: 'Email and password are required' });
           }

           const user = await User.findOne({ email });
           if (!user) {
             return res.status(401).json({ error: 'Invalid credentials' });
           }

           const isMatch = await user.comparePassword(password);
           if (!isMatch) {
             return res.status(401).json({ error: 'Invalid credentials' });
           }

           const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
             expiresIn: '1h',
           });
           res.status(200).json({ token, userId: user.userId });
         } catch (error) {
           console.error('Login error:', error);
           res.status(500).json({ error: 'Failed to login' });
         }
       });

       module.exports = router;