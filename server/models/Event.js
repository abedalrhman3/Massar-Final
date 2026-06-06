const mongoose = require('mongoose');
const contactSchema = require('./contactSchema');

const eventSchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    customOverview: { type: String },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    startTime: { type: String }, // e.g. "8:00 AM"
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    endTime: { type: String }, // e.g. "5:00 PM"
    startingFromPrice: { type: String },
    durationText: { type: String },
    bookingUrl: { type: String },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
    coverImage: { type: String, required: true },
    images: {
      type: [String],
      default: [],
    },
    contact: { type: contactSchema, default: () => ({}) },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventSchema.index({ destinationId: 1 });
eventSchema.index({ categoryId: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Event', eventSchema);
