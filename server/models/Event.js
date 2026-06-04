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
    startTime: {
      from: { type: Date, required: true },  // 2026-01-07T08:00:00.000+03:00
      to: { type: Date, required: true },  // 2026-01-07T21:00:00.000+03:00
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    endTime: {
      from: { type: Date, required: true },  // 2026-01-08T08:00:00.000+03:00
      to: { type: Date, required: true },  // 2026-01-08T21:00:00.000+03:00
    },
    startingFromPrice: { type: Number },
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
