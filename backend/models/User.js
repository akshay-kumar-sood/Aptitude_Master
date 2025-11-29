const mongoose = require('mongoose');

const SolvedQuestionSchema = new mongoose.Schema({
  correct: Boolean,
  date: String,
  attemptedOption: String,
  usedHint: Boolean
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Note: In production, use bcrypt to hash passwords
  
  // Flattened UserProgress structure
  totalSolved: { type: Number, default: 0 },
  easySolved: { type: Number, default: 0 },
  mediumSolved: { type: Number, default: 0 },
  hardSolved: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  
  // Maps are tricky in simple JSON sync, using Object type for simplicity with the sync logic
  // Using mongoose.Schema.Types.Mixed to preserve empty objects and nested structures
  solvedQuestions: { 
    type: mongoose.Schema.Types.Mixed, 
    default: () => ({}) 
  },
  activityByDate: { 
    type: mongoose.Schema.Types.Mixed, 
    default: () => ({}) 
  },
  inventory: { type: [String], default: ['starter_badge'] },
  
  // Profile
  maxStreak: { type: Number, default: 0 },
  profileName: { type: String, default: 'User' },
  profileImage: { type: String, default: null },
  profileBio: { type: String, default: 'Aspiring Aptitude Master' },
  socialLinks: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({
      linkedin: '',
      instagram: '',
      github: ''
    })
  }
}, { minimize: false, timestamps: true });

module.exports = mongoose.model('User', UserSchema);