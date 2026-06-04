const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['place', 'restaurant', 'hotel', 'event'],
      required: [true, 'Type is required'],
    },
    icon: {
      type: String,
    },
  },
  { timestamps: true }
);

categorySchema.index({ type: 1 });

module.exports = mongoose.model('Category', categorySchema);
