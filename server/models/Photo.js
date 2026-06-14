const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    quest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest',
      default: null,
    },
    task_index: { type: Number, default: 0 },
    photo_url: { type: String, required: true }, // Cloudinary URL
    is_private: { type: Boolean, default: false },
    is_reported: { type: Boolean, default: false },

    // ── AI Moderation ────────────────────────────────────
    // null  = AI check not run yet (non-quest photos)
    // true  = AI passed this check
    // false = AI failed this check
    ai_appropriate: { type: Boolean, default: null },
    ai_fulfills_quest: { type: Boolean, default: null },
    ai_reason: { type: String, default: null }, // shown to user on rejection

    // pending_review → inappropriate photo, waiting for admin decision
    // approved       → AI approved (quest done) OR admin manually approved
    // rejected       → AI rejected (wrong photo) OR admin manually rejected
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected'],
      default: null, // null for non-quest photos (legacy/location check-ins)
    },
  },
  { timestamps: true }
);

photoSchema.index({ user_id: 1 });
photoSchema.index({ location_id: 1 });
photoSchema.index({ is_reported: 1 });
photoSchema.index({ status: 1 }); // for admin panel queries

module.exports = mongoose.model('Photo', photoSchema);