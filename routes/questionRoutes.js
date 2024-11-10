const express = require('express');
const router = express.Router();
const {getByTopicId} = require('../controllers/questionControllers');

router.get('/:topicId', getByTopicId);

module.exports = router;
