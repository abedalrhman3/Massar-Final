const mongoose = require('mongoose');
const contactSchema = require('./contactSchema');

const restaurantSchema = new mongoose.Schema(
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
    contact: { type: contactSchema, default: () => ({}) },
    isPublished: { type: Boolean, default: false },
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
  },
  { timestamps: true }
);

restaurantSchema.index({ destinationId: 1 });
restaurantSchema.index({ categoryId: 1 });
restaurantSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
