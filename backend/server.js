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
  
  const userObj = user.toObject ? user.toObject({ getters: true, virtuals: false }) : user;
  
  // Convert Mixed types to plain objects if they're Maps or other types
  let solvedQuestions = userObj.solvedQuestions;
  if (solvedQuestions && typeof solvedQuestions === 'object' && !Array.isArray(solvedQuestions)) {
    if (solvedQuestions instanceof Map) {
      solvedQuestions = Object.fromEntries(solvedQuestions);
    }
  } else {
    solvedQuestions = {};
  }
  
  let activityByDate = userObj.activityByDate;
  if (activityByDate && typeof activityByDate === 'object' && !Array.isArray(activityByDate)) {
    if (activityByDate instanceof Map) {
      activityByDate = Object.fromEntries(activityByDate);
    }
  } else {
    activityByDate = {};
  }
  
  let socialLinks = userObj.socialLinks;
  if (socialLinks && typeof socialLinks === 'object' && !Array.isArray(socialLinks)) {
    if (socialLinks instanceof Map) {
      socialLinks = Object.fromEntries(socialLinks);
    }
  } else {
    socialLinks = {
      linkedin: '',
      instagram: '',
      github: ''
    };
  }
  
  // Ensure all fields have defaults
  return {
    ...userObj,
    totalSolved: userObj.totalSolved ?? 0,
    easySolved: userObj.easySolved ?? 0,
    mediumSolved: userObj.mediumSolved ?? 0,
    hardSolved: userObj.hardSolved ?? 0,
    points: userObj.points ?? 0,
    solvedQuestions: solvedQuestions,
    activityByDate: activityByDate,
    inventory: Array.isArray(userObj.inventory) && userObj.inventory.length > 0 
      ? userObj.inventory 
      : ['starter_badge'],
    maxStreak: userObj.maxStreak ?? 0,
    profileName: userObj.profileName || userObj.name || 'User',
    profileImage: userObj.profileImage ?? null,
    profileBio: userObj.profileBio || 'Aspiring Aptitude Master',
    socialLinks: {
      linkedin: socialLinks.linkedin || '',
      instagram: socialLinks.instagram || '',
      github: socialLinks.github || ''
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

    // Create user with default progress values - explicitly set all fields
    const user = new User({ 
      name, 
      email, 
      password,
      profileName: name,
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      points: 0,
      solvedQuestions: {},
      activityByDate: {},
      inventory: ['starter_badge'],
      maxStreak: 0,
      profileImage: null,
      profileBio: 'Aspiring Aptitude Master',
      socialLinks: {
        linkedin: '',
        instagram: '',
        github: ''
      }
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

// Get User Data
app.get('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userData = ensureUserDefaults(user);
    const { password: _, ...data } = userData;
    res.json({ success: true, user: data });
  } catch (err) {
    console.error('Get user error:', err);
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

    // Always update all fields to ensure they're saved
    // Update numeric fields
    user.totalSolved = progress.totalSolved !== undefined ? (progress.totalSolved ?? 0) : user.totalSolved;
    user.easySolved = progress.easySolved !== undefined ? (progress.easySolved ?? 0) : user.easySolved;
    user.mediumSolved = progress.mediumSolved !== undefined ? (progress.mediumSolved ?? 0) : user.mediumSolved;
    user.hardSolved = progress.hardSolved !== undefined ? (progress.hardSolved ?? 0) : user.hardSolved;
    user.points = progress.points !== undefined ? (progress.points ?? 0) : user.points;
    user.maxStreak = progress.maxStreak !== undefined ? (progress.maxStreak ?? 0) : user.maxStreak;
    
    // Update string fields
    if (progress.profileName !== undefined) user.profileName = progress.profileName || user.name || 'User';
    if (progress.profileImage !== undefined) user.profileImage = progress.profileImage ?? null;
    if (progress.profileBio !== undefined) user.profileBio = progress.profileBio || 'Aspiring Aptitude Master';
    
    // Update objects - always set them, even if empty
    // Use set() method for Mixed types to ensure they're saved
    if (progress.solvedQuestions !== undefined) {
      const solvedQs = progress.solvedQuestions && typeof progress.solvedQuestions === 'object' 
        ? progress.solvedQuestions 
        : {};
      user.set('solvedQuestions', solvedQs);
    }
    
    if (progress.activityByDate !== undefined) {
      const activity = progress.activityByDate && typeof progress.activityByDate === 'object'
        ? progress.activityByDate
        : {};
      user.set('activityByDate', activity);
    }
    
    // Update inventory
    if (progress.inventory !== undefined) {
      user.inventory = Array.isArray(progress.inventory) && progress.inventory.length > 0 
        ? progress.inventory 
        : ['starter_badge'];
    }
    
    // Update socialLinks - always ensure it's an object
    if (progress.socialLinks !== undefined) {
      const links = progress.socialLinks && typeof progress.socialLinks === 'object'
        ? {
            linkedin: progress.socialLinks.linkedin || '',
            instagram: progress.socialLinks.instagram || '',
            github: progress.socialLinks.github || ''
          }
        : {
            linkedin: '',
            instagram: '',
            github: ''
          };
      user.set('socialLinks', links);
    }

    // Mark all Mixed fields as modified to ensure MongoDB saves them
    user.markModified('solvedQuestions');
    user.markModified('activityByDate');
    user.markModified('socialLinks');

    // Save the user
    await user.save();

    // Reload from DB to get the actual saved state
    const savedUser = await User.findOne({ email });
    const userData = ensureUserDefaults(savedUser);
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
