const Question = require('../model/questionModel');

module.exports.getByTopicId = async (req, res) => {
  const { topicId } = req.params;
  console.log(topicId);

  try {
    const questions = await Question.find({ topicId }).populate('topicId');
    // console.log(questions)
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// // db.questions.find({}).forEach(function(doc) {
//   if (typeof doc.topicId === "string") {
//     db.questions.updateOne(
//       { _id: doc._id }, // Match the specific document by its _id
//       { $set: { topicId: ObjectId(doc.topicId) } } // Convert topicId to ObjectId
//     );
//   }
// });

module.exports.getAllQuestions = async (req, res) => {
  try {
    // Find all questions and populate the topicId field with details from the Topic collection
    const questions = await Question.find();
    
    // Respond with the list of questions
    res.status(200).json(questions);
  } catch (error) {
    // Handle any errors during the fetch process
    console.error('Error fetching questions:', error.message);
    res.status(500).json({ message: error.message });
  }
};