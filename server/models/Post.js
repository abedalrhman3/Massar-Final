const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    content:   { type: String, required: true },
    image_url: { type: String },
    rating:    { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

postSchema.index({ location_id: 1 });
postSchema.index({ user_id: 1 });

module.exports = mongoose.model('Post', postSchema);
