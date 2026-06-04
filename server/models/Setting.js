const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    budget_ranges: {
      low_max: { type: Number, default: 50 },
      mid_max: { type: Number, default: 150 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
