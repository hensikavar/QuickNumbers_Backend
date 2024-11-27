const express = require('express');
const router = express.Router();
const {getByTopicId, getAllQuestions} = require('../controllers/questionControllers');

router.get('/:topicId', getByTopicId);
router.get('/', getAllQuestions);

module.exports = router;
