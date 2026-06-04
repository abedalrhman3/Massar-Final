const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
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
    task_index:  { type: Number, default: 0 },
    photo_url:   { type: String, required: true }, // Cloudinary URL
    is_private:  { type: Boolean, default: false },
    is_reported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

photoSchema.index({ user_id: 1 });
photoSchema.index({ location_id: 1 });
photoSchema.index({ is_reported: 1 });

module.exports = mongoose.model('Photo', photoSchema);
