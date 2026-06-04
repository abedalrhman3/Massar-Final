const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entityType: {
      type: String,
      enum: ['place', 'restaurant', 'hotel', 'event', 'destination'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Prevent a user from saving the same item twice
savedItemSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });
savedItemSchema.index({ userId: 1 });

module.exports = mongoose.model('SavedItem', savedItemSchema);
