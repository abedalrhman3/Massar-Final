const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Achievement name is required'],
      trim: true,
    },
    triggerType: {
      type: String,
      enum: ['visit_count', 'save_count', 'review_count', 'login_streak', 'custom'],
      required: true,
    },
    triggerValue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
