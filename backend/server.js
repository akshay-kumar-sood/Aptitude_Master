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

    const user = new User({ name, email, password });
    await user.save();

    const { password: _, ...data } = user.toObject();
    res.json({ user: data });
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
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =================== SERVER ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Backend running'));
