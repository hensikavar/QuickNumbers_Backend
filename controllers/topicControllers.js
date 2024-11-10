//get all
const Topic = require("../model/topicModel");

// Get all topics
module.exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving topics", error: err });
  }
};

//post
// module.exports.createTopic = async (req, res) => {
//   const { topicId, topicName, isActive, sequence } = req.body;

//   // Ensure required fields are provided
//   if (!topicId || !topicName || sequence == null) {
//     return res.status(400).json({ message: "Required fields are missing" });
//   }

//   try {
//     const newTopic = new Topic({ topicId, topicName, isActive, sequence });
//     const savedTopic = await newTopic.save();

//     res.status(201).json({ message: "Topic created successfully", data: savedTopic });
//   } catch (err) {
//     res.status(500).json({ message: "Error creating topic", error: err });
//   }
// };