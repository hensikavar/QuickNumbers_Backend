const express = require("express");
const router = express.Router();
const {
  createPracticeRecord,
  getPracticeRecordsByUserId
} = require("../controllers/practiceControllers");

router.post("/", createPracticeRecord);
router.get("/:userId", getPracticeRecordsByUserId);

module.exports = router;
