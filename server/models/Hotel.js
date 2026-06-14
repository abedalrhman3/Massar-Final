const mongoose = require('mongoose');
const contactSchema = require('./contactSchema');

const hotelSchema = new mongoose.Schema(
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
    name: { type: String, required: true },
    googlePlaceId: { type: String },
    customOverview: { type: String },
    bookingUrl: { type: String },
    budget: { type: String },
    operatingHours: {
      start: { type: String },
      end: { type: String },
    },
    workingDays: {
      type: [String],
      default: [],
    },
    contact: { type: contactSchema, default: () => ({}) },
    isPublished: { type: Boolean, default: false },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], 
        default: undefined,
      },
    },
    coverImage: { type: String, required: true },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

hotelSchema.index({ destinationId: 1 });
hotelSchema.index({ categoryId: 1 });
hotelSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
