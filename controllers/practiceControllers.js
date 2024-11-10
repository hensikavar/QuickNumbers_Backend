const Practice = require("../model/practiceModel");

module.exports.createPracticeRecord = async (req, res) => {
  const { userId, topicId, score, attemptNo, level, date, totalTime } = req.body;

  try {
    const practice = new Practice({
      userId,
      topicId,
      score,
      attemptNo,
      level,
      date,
      totalTime
    });

    await practice.save();
    res.status(201).json({ message: "Practice record created successfully", practice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports.getPracticeRecordsByUserId = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const practiceRecords = await Practice.find({ userId }).populate("topicId").populate("userId");
      res.status(200).json(practiceRecords);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  