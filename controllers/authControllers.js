const User = require("../model/authModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
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

  if (err.code === 11000) {
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

// Get user by ID
module.exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("username email mobile password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.forgotPassword =  async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    console.log(otp);

    // Save OTP and expiration time in the user object
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "hensikavar5129@gmail.com",
        pass: "pkwi sorb ghep hmvh",
      },
    });

    const mailOptions = {
      from: "hensikavar5129@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

module.exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find the user by email and OTP
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is valid
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP and expiry
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
};

