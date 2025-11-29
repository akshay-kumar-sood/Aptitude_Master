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

// Pre-save hook to ensure all fields are always present
UserSchema.pre('save', function(next) {
  // Ensure solvedQuestions is always an object
  if (!this.solvedQuestions || typeof this.solvedQuestions !== 'object' || Array.isArray(this.solvedQuestions)) {
    this.solvedQuestions = {};
  }
  
  // Ensure activityByDate is always an object
  if (!this.activityByDate || typeof this.activityByDate !== 'object' || Array.isArray(this.activityByDate)) {
    this.activityByDate = {};
  }
  
  // Ensure socialLinks is always an object with the right structure
  if (!this.socialLinks || typeof this.socialLinks !== 'object' || Array.isArray(this.socialLinks)) {
    this.socialLinks = {
      linkedin: '',
      instagram: '',
      github: ''
    };
  } else {
    // Ensure all social link fields exist
    this.socialLinks.linkedin = this.socialLinks.linkedin || '';
    this.socialLinks.instagram = this.socialLinks.instagram || '';
    this.socialLinks.github = this.socialLinks.github || '';
  }
  
  // Ensure inventory is always an array with at least one item
  if (!Array.isArray(this.inventory) || this.inventory.length === 0) {
    this.inventory = ['starter_badge'];
  }
  
  // Ensure numeric fields have defaults
  this.totalSolved = this.totalSolved ?? 0;
  this.easySolved = this.easySolved ?? 0;
  this.mediumSolved = this.mediumSolved ?? 0;
  this.hardSolved = this.hardSolved ?? 0;
  this.points = this.points ?? 0;
  this.maxStreak = this.maxStreak ?? 0;
  
  // Ensure string fields have defaults
  this.profileName = this.profileName || this.name || 'User';
  this.profileBio = this.profileBio || 'Aspiring Aptitude Master';
  
  next();
});

module.exports = mongoose.model('User', UserSchema);