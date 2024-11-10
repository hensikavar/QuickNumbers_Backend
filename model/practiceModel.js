const mongoose = require("mongoose");

const practiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users", // Assuming "User" is the model name for users collection
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic", // Assuming "Topic" is the model name for topics collection
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  attemptNo: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  totalTime: {
    type: Number, // Store time in seconds or minutes, based on preference
    required: true
  }
});

module.exports = mongoose.model("Practice", practiceSchema);
