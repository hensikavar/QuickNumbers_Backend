const { register, login ,updateUser ,getUserById,forgotPassword, updateUserPassword } = require("../controllers/authControllers");
const { checkUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/", checkUser); 
router.post("/register", register);
router.post("/login", login);
router.put("/edit/:id", updateUser);
router.put('/edit/password/:id',updateUserPassword)
router.get("/:id", getUserById);
router.post("/forgot-password", forgotPassword);


module.exports = router;
