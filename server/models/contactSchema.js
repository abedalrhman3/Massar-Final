const mongoose = require('mongoose');

// Reusable embedded contact schema
// Import this in Place, Restaurant, Hotel, and Event models
const contactSchema = new mongoose.Schema(
  {
    phone:        { type: String },
    whatsapp:     { type: String },
    email:        { type: String },
    address:      { type: String },
    instagramUrl: { type: String },
    twitterUrl:   { type: String },
  },
  { _id: false }
);

module.exports = contactSchema;
