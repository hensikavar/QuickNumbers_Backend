const User = require("../model/authModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "kishan sheth super secret key", {
    expiresIn: maxAge,
  });
};

const handleErrors = (err) => {
  let errors = {  mobile: "" , password: ""};

  console.log(err);

  if (err.message === "incorrect mobile number") {
    errors.mobile = "That mobile number is incorrect";
  }

  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  if (err.code === 11000 && err.keyPattern && err.keyPattern.mobile) {
    errors.mobile = "Mobile Number is already registered";
    return errors;
  }

  if (err.message.includes("Users validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.register = async (req, res, next) => {
  try {
    const {username , email, password  , mobile} = req.body;
    const user = await User.create({username, email, password,mobile });
    const token = createToken(user._id);

    res.cookie("jwt", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: maxAge * 1000,
    });

    res.status(201).json({ user: user._id, created: true });
  } catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.json(errors);
    // res.json({ errors, created: false });
  }
};

module.exports.login = async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const user = await User.login(mobile, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id, status: true });
  } catch (err) {
    const errors = handleErrors(err);
    // res.json(err.message);
    res.json(errors);
    // res.json({ errors, status: false });
  }
};


module.exports.updateUser = async(req , res)=>{
  const {username , email , password , mobile} = req.body;
  const { id } = req.params; 
  try {
    // Prepare updated fields
    const updatedFields = {
      username,
      email,
      mobile,
    };

    // If a new password is provided, hash it before updating
    if (password) {
      const salt = await bcrypt.genSalt();
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    // Update the user in the database
    const user = await User.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    res.status(200).json({ user, message: "User updated successfully", status: true });
  } catch (err) {
    res.status(500).json(err);
    // res.status(500).json({ error: err.message, status: false });
  }
}