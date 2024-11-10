const { register, login ,updateUser ,getUserById } = require("../controllers/authControllers");
const { checkUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/", checkUser); 
router.post("/register", register);
router.post("/login", login);
router.put("/edit/:id", updateUser);
router.get("/:id", getUserById);

module.exports = router;
