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
      default: null,
    },
    quest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest',
      default: null,
    },
    task_index: { type: Number, default: 0 },
    photo_url: { type: String, required: true }, 
    is_private: { type: Boolean, default: false },
    is_reported: { type: Boolean, default: false },

    
    
    
    
    ai_appropriate: { type: Boolean, default: null },
    ai_fulfills_quest: { type: Boolean, default: null },
    ai_reason: { type: String, default: null }, 

    
    
    
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected'],
      default: null, 
    },
  },
  { timestamps: true }
);

photoSchema.index({ user_id: 1 });
photoSchema.index({ location_id: 1 });
photoSchema.index({ is_reported: 1 });
photoSchema.index({ status: 1 }); 

module.exports = mongoose.model('Photo', photoSchema);