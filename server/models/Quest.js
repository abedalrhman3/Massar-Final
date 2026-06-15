const mongoose = require('mongoose');

const questSchema = new mongoose.Schema(
  {
    title: { type: String },
    title_en: { type: String, required: true },
    description: { type: String },
    description_en: { type: String, required: true },
    locations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
      },
    ],
    bonus_xp: { type: Number, default: 200 },
    title_reward: { type: String },
    badge_url: { type: String },
    icon_url: { type: String },
    start_coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },






    ai_requirement: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quest', questSchema);