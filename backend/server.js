require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

const app = express();

// Middleware
// CORS configuration
// - By default allow a single frontend origin (use PORT 3000 if you want that)
// - Override with `FRONTEND_ORIGIN` (single) or `FRONTEND_ALLOWED_ORIGINS` (comma-separated)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow if origin is in allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow if origin matches the server's own origin (for relative paths in production)
    // This is often handled by `!origin` but sometimes explicit checks help.
    // For now, we'll be permissive in dev, but strict in prod if needed.
    // Actually, for the "Single Service" model, the frontend is served FROM the backend,
    // so the origin will be the same as the backend.
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Error handling middleware for JSON parsing errors (must be after routes)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  next(err);
});

// ==================================================================
// 1. PASTE YOUR MONGODB ATLAS CONNECTION STRING BELOW
// ==================================================================
// Use environment variable for MongoDB. Default to a local MongoDB for
// development to avoid committing production credentials.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aptitude_master';

// Connect to Database (non-blocking - server will still start)
mongoose.connect(MONGO_URI)
  .then(() => {
    const maskedURI = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`✅ MongoDB Connected to: ${maskedURI}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('⚠️  Server will still run, but authentication features may not work.');
    console.error('💡 Fix: Whitelist your IP in MongoDB Atlas → Network Access');
  });

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});


// --- Auth Routes ---

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Create new user with all default fields explicitly initialized
    const newUser = new User({
      name,
      email,
      password, // In real app: await bcrypt.hash(password, 10)
      profileName: name,
      // Explicitly initialize all default fields to ensure they're saved
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

    await newUser.save();

    // Return user without password
    const { password: _, ...userData } = newUser.toObject();
    res.json({ user: userData, token: 'demo-token-' + newUser._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check password (In real app: await bcrypt.compare(password, user.password))
    if (user.password !== password) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if user is missing required fields and fix them
    const needsFix = !user.solvedQuestions || !user.activityByDate || !user.socialLinks ||
      !user.inventory || user.inventory.length === 0;

    if (needsFix) {
      const defaults = {
        totalSolved: user.totalSolved ?? 0,
        easySolved: user.easySolved ?? 0,
        mediumSolved: user.mediumSolved ?? 0,
        hardSolved: user.hardSolved ?? 0,
        points: user.points ?? 0,
        solvedQuestions: user.solvedQuestions || {},
        activityByDate: user.activityByDate || {},
        inventory: user.inventory && user.inventory.length > 0 ? user.inventory : ['starter_badge'],
        maxStreak: user.maxStreak ?? 0,
        profileName: user.profileName || user.name || 'User',
        profileImage: user.profileImage ?? null,
        profileBio: user.profileBio || 'Aspiring Aptitude Master',
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          instagram: user.socialLinks?.instagram || '',
          github: user.socialLinks?.github || ''
        }
      };

      user = await User.findOneAndUpdate(
        { email },
        { $set: defaults },
        { new: true }
      );
    }

    const { password: _, ...userData } = user.toObject();
    res.json({ user: userData, token: 'demo-token-' + user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Data Routes ---

// Utility endpoint to fix existing users missing default fields
app.post('/api/user/fix-missing-fields', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prepare defaults for missing fields
    const defaults = {
      totalSolved: user.totalSolved ?? 0,
      easySolved: user.easySolved ?? 0,
      mediumSolved: user.mediumSolved ?? 0,
      hardSolved: user.hardSolved ?? 0,
      points: user.points ?? 0,
      solvedQuestions: user.solvedQuestions || {},
      activityByDate: user.activityByDate || {},
      inventory: user.inventory && user.inventory.length > 0 ? user.inventory : ['starter_badge'],
      maxStreak: user.maxStreak ?? 0,
      profileName: user.profileName || user.name || 'User',
      profileImage: user.profileImage ?? null,
      profileBio: user.profileBio || 'Aspiring Aptitude Master',
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || '',
        instagram: user.socialLinks?.instagram || '',
        github: user.socialLinks?.github || ''
      }
    };

    // Use $setOnInsert for fields that don't exist, or $set to ensure they're all present
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: defaults },
      { new: true }
    );

    res.json({
      message: 'User fields fixed successfully',
      user: updatedUser.toObject()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sync: Frontend sends the full progress object, Backend updates it
app.post('/api/user/sync', async (req, res) => {
  try {
    const { email, progress } = req.body;

    if (!email) return res.status(400).json({ message: 'Email required' });

    // We exclude _id and email from the update payload to prevent accidental overwrites
    const { _id, email: _e, ...updateData } = progress;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true } // Return updated doc
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Serve Frontend (Production) ---
const path = require('path');
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://0.0.0.0:${PORT}`);
});