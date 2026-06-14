const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    description: { type: String },
    description_en: { type: String },
    xp: { type: Number, default: 50 },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    name_en: { type: String, required: true },
    description: { type: String },
    description_en: { type: String },
    coordinates: {
      lat: { type: Number },  
      lng: { type: Number },
    },
    budget_category: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
    },
    average_cost: { type: Number },
    xp_reward: { type: Number, default: 100 },
    badge_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
    },
    tasks: { type: [taskSchema], default: [] },
    destination_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', locationSchema);