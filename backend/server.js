require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

const app = express();

// =================== CORS ===================
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// =================== DB ===================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo Connected"))
  .catch(err => console.log("Mongo Error:", err.message));

// =================== ROUTES ===================

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'User already exists' });

    // Create user with default progress values
    const user = new User({ 
      name, 
      email, 
      password,
      profileName: name,
      // All other fields have defaults in the schema
    });
    await user.save();

    const { password: _, ...data } = user.toObject();
    res.json({ user: data, token: 'mock-token' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.password !== password)
      return res.status(400).json({ message: 'Invalid credentials' });

    const { password: _, ...data } = user.toObject();
    res.json({ user: data, token: 'mock-token' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sync User Progress
app.post('/api/user/sync', async (req, res) => {
  try {
    const { email, progress } = req.body;

    if (!email || !progress) {
      return res.status(400).json({ message: 'Email and progress are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user with progress data (preserve existing values if not provided)
    if (progress.totalSolved !== undefined) user.totalSolved = progress.totalSolved;
    if (progress.easySolved !== undefined) user.easySolved = progress.easySolved;
    if (progress.mediumSolved !== undefined) user.mediumSolved = progress.mediumSolved;
    if (progress.hardSolved !== undefined) user.hardSolved = progress.hardSolved;
    if (progress.points !== undefined) user.points = progress.points;
    if (progress.solvedQuestions !== undefined) user.solvedQuestions = progress.solvedQuestions;
    if (progress.activityByDate !== undefined) user.activityByDate = progress.activityByDate;
    if (progress.inventory !== undefined) user.inventory = progress.inventory;
    if (progress.maxStreak !== undefined) user.maxStreak = progress.maxStreak;
    if (progress.profileName !== undefined) user.profileName = progress.profileName;
    if (progress.profileImage !== undefined) user.profileImage = progress.profileImage;
    if (progress.profileBio !== undefined) user.profileBio = progress.profileBio;
    if (progress.socialLinks !== undefined) {
      if (!user.socialLinks) {
        user.socialLinks = {
          linkedin: '',
          instagram: '',
          github: ''
        };
      }
      if (progress.socialLinks.linkedin !== undefined) user.socialLinks.linkedin = progress.socialLinks.linkedin;
      if (progress.socialLinks.instagram !== undefined) user.socialLinks.instagram = progress.socialLinks.instagram;
      if (progress.socialLinks.github !== undefined) user.socialLinks.github = progress.socialLinks.github;
    }

    await user.save();

    const { password: _, ...data } = user.toObject();
    res.json({ success: true, user: data });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ message: err.message });
  }
});

// =================== SERVER ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Backend running'));
