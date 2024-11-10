const express = require("express");
const router = express.Router();
const {getAllTopics} = require("../controllers/topicControllers");

// Route to get all topics
router.get("/", getAllTopics);
// router.post("/", createTopic);

module.exports = router;
