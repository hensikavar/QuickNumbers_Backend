const { register, login ,updateUser ,getUserById,forgotPassword } = require("../controllers/authControllers");
const { checkUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/", checkUser); 
router.post("/register", register);
router.post("/login", login);
router.put("/edit/:id", updateUser);
router.get("/:id", getUserById);
router.post("/forgot-password", forgotPassword);
// router.post("/verify-otp", verifyOTP);
//router.put("/reset-password", resetPassword);


module.exports = router;
