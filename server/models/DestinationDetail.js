const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  { name: { type: String } },
  { _id: false }
);

const guideSectionSchema = new mongoose.Schema(
  {
    title: { type: String, enum: ["How to get there", "Best time to visit", "What to bring"] },
    content: { type: String },
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


    overview: {
      text: { type: String },
      locationText: { type: String },
      recommendedStay: { type: String },
      bestSeason: { type: String },
      averageCost: { type: String },
    },


    activities: { type: [activitySchema], default: [] },
    guideSections: { type: [guideSectionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DestinationDetail', destinationDetailSchema);
