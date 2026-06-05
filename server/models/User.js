const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // ── Core fields (your part) ─────────────────────────
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
      required: [true, 'Password is required'],
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },

    // ── Gamification fields (teammate's part) ───────────
    username: {
      type: String,
      unique: true,
      sparse: true, // allows null while keeping unique constraint
      trim: true,
    },
    current_level: {
      type: String,
      default: 'Explorer',
    },
    total_xp: {
      type: Number,
      default: 0,
    },
    active_frame_slug: {
      type: String,
      default: 'default-frame',
    },
    unlocked_badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
    unlocked_frames: {
      type: [String],
      default: ['default-frame'],
    },
    unlocked_titles: {
      type: [String],
      default: [],
    },
    completed_quests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest',
      },
    ],
    completed_locations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
      },
    ],
    joined_quests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest',
      },
    ],
    likedDestinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
