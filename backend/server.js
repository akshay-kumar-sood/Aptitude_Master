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

// =================== HELPER FUNCTIONS ===================

// Ensure user object has all required fields with defaults
const ensureUserDefaults = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  
  // Ensure all fields have defaults
  return {
    ...userObj,
    totalSolved: userObj.totalSolved ?? 0,
    easySolved: userObj.easySolved ?? 0,
    mediumSolved: userObj.mediumSolved ?? 0,
    hardSolved: userObj.hardSolved ?? 0,
    points: userObj.points ?? 0,
    solvedQuestions: userObj.solvedQuestions ?? {},
    activityByDate: userObj.activityByDate ?? {},
    inventory: Array.isArray(userObj.inventory) && userObj.inventory.length > 0 
      ? userObj.inventory 
      : ['starter_badge'],
    maxStreak: userObj.maxStreak ?? 0,
    profileName: userObj.profileName || userObj.name || 'User',
    profileImage: userObj.profileImage ?? null,
    profileBio: userObj.profileBio || 'Aspiring Aptitude Master',
    socialLinks: userObj.socialLinks && typeof userObj.socialLinks === 'object'
      ? {
          linkedin: userObj.socialLinks.linkedin || '',
          instagram: userObj.socialLinks.instagram || '',
          github: userObj.socialLinks.github || ''
        }
      : {
          linkedin: '',
          instagram: '',
          github: ''
        }
  };
};

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

    const userData = ensureUserDefaults(user);
    const { password: _, ...data } = userData;
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

    const userData = ensureUserDefaults(user);
    const { password: _, ...data } = userData;
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
    // Use nullish coalescing to ensure we preserve existing values
    if (progress.totalSolved !== undefined && progress.totalSolved !== null) user.totalSolved = progress.totalSolved;
    if (progress.easySolved !== undefined && progress.easySolved !== null) user.easySolved = progress.easySolved;
    if (progress.mediumSolved !== undefined && progress.mediumSolved !== null) user.mediumSolved = progress.mediumSolved;
    if (progress.hardSolved !== undefined && progress.hardSolved !== null) user.hardSolved = progress.hardSolved;
    if (progress.points !== undefined && progress.points !== null) user.points = progress.points;
    
    // For objects, ensure we preserve them even if empty
    if (progress.solvedQuestions !== undefined) {
      user.solvedQuestions = progress.solvedQuestions || {};
    }
    if (progress.activityByDate !== undefined) {
      user.activityByDate = progress.activityByDate || {};
    }
    
    if (progress.inventory !== undefined) {
      user.inventory = Array.isArray(progress.inventory) ? progress.inventory : (user.inventory || ['starter_badge']);
    }
    
    if (progress.maxStreak !== undefined && progress.maxStreak !== null) user.maxStreak = progress.maxStreak;
    if (progress.profileName !== undefined) user.profileName = progress.profileName || user.name || 'User';
    if (progress.profileImage !== undefined) user.profileImage = progress.profileImage;
    if (progress.profileBio !== undefined) user.profileBio = progress.profileBio || 'Aspiring Aptitude Master';
    
    // Ensure socialLinks object exists and is properly structured
    if (!user.socialLinks) {
      user.socialLinks = {
        linkedin: '',
        instagram: '',
        github: ''
      };
    }
    
    if (progress.socialLinks !== undefined) {
      if (progress.socialLinks.linkedin !== undefined) user.socialLinks.linkedin = progress.socialLinks.linkedin || '';
      if (progress.socialLinks.instagram !== undefined) user.socialLinks.instagram = progress.socialLinks.instagram || '';
      if (progress.socialLinks.github !== undefined) user.socialLinks.github = progress.socialLinks.github || '';
    }

    // Mark fields as modified to ensure MongoDB saves them even if they're empty objects
    user.markModified('solvedQuestions');
    user.markModified('activityByDate');
    user.markModified('socialLinks');

    await user.save();

    const userData = ensureUserDefaults(user);
    const { password: _, ...data } = userData;
    res.json({ success: true, user: data });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ message: err.message });
  }
});

// =================== SERVER ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Backend running'));
