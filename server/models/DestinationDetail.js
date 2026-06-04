const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    name:      { type: String },
    icon:      { type: String },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const guideSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['tips', 'safety', 'culture', 'transport', 'food', 'other'],
    },
    title:     { type: String },
    content:   { type: String },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const destinationDetailSchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
      unique: true,
    },

    // Embedded overview object
    overview: {
      text:            { type: String },
      locationText:    { type: String },
      recommendedStay: { type: String },
      bestSeason:      { type: String },
      averageCost:     { type: String },
      pricingSummary:  { type: String },
      bookTourUrl:     { type: String },
    },

    // Embedded arrays
    activities:    { type: [activitySchema], default: [] },
    guideSections: { type: [guideSectionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DestinationDetail', destinationDetailSchema);
