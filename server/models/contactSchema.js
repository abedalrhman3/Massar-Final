const mongoose = require('mongoose');

const contactMethodSchema = new mongoose.Schema(
  {
    type:  { type: String }, 
    value: { type: String }, 
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  { methods: { type: [contactMethodSchema], default: [] } },
  { _id: false }
);

module.exports = contactSchema;
