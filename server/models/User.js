const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function () { return !(this.googleId || this.facebookId || this.discordId || this.instagramId); },
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'user'],
      default: 'user',
    },
    avatar_url: {
      type: String,
      default: null,
    },
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    discordId: { type: String, sparse: true },
    instagramId: { type: String, sparse: true },
    avatar: { type: String },

    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },

    
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },

    
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },

    
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    current_level: { type: String, default: 'Explorer' },
    total_xp: { type: Number, default: 0 },
    uploaded_photos: { type: Number, default: 0 },
    active_frame_slug: { type: String, default: 'default-frame' },

    unlocked_badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],

    earned_quest_badges: [
      {
        quest_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
        title: { type: String },
        title_en: { type: String },
        icon_url: { type: String },
        earned_at: { type: Date, default: Date.now },
      },
    ],

    unlocked_frames: { type: [String], default: ['default-frame'] },
    unlocked_titles: { type: [String], default: [] },

    completed_quests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
    completed_locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    joined_quests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
    likedDestinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);