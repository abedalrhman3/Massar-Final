const mongoose = require('mongoose');

const contactMethodSchema = new mongoose.Schema(
  {
    type:  { type: String }, // e.g. "phone", "whatsapp", "facebook", "instagram", "x", "email"
    value: { type: String }, // the actual number/handle/URL
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  { methods: { type: [contactMethodSchema], default: [] } },
  { _id: false }
);

module.exports = contactSchema;
