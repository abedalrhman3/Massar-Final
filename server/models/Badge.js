const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    title_en: {
      type: String,
    },
    icon_url: {
      type: String,
      required: [true, 'Icon URL is required'],
    },
    is_rare: {
      type: Boolean,
      default: false,
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
