const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  
  topicName: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sequence: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Topic", topicSchema);
