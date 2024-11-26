const Question = require('../model/questionModel');

module.exports.getByTopicId = async (req, res) => {
  const { topicId } = req.params;
  console.log(topicId);

  try {
    const questions = await Question.find({ topicId }).populate('topicId');
    console.log(questions)
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
