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
    errors.email = "Email Address is already registered";
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
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
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

module.exports.updateUser = async (req, res) => {
  const { username, email, mobile, password } = req.body; // Include oldPassword from the request
  const { id } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      console.log("User tried");
      return res.status(404).json({ message: "User not found", status: false });
    }

    // Compare the provided old password with the stored password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Old password is incorrect", status: false });
    }

    // Prepare updated fields
    const updatedFields = {
      username,
      email,
      mobile,
    };

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({ user: updatedUser, message: "User updated successfully", status: true });
  } catch (err) {
    res.status(500).json({ error: err.message, status: false });
  }
};


module.exports.updateUserPassword = async(req , res)=>{
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
        user: process.env.email,
        pass: process.env.password,
      },
    });

    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="text-align: center; color: #007BFF;">Quick Numbers - Password Reset</h2>
          <p>Dear User,</p>
          <p>We received a request to reset your password. Please use the OTP below to reset it. The OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="text-align: center; font-size: 24px; font-weight: bold; color: white ;background-color : black; margin: 20px 0;">${otp}</p>
          <p>Best regards,</p>
          <p><strong>Quick Numbers Team</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });

    
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
    };

    res.status(200).json({
      user: userResponse,
      message: "OTP sent to email",
      otp: otp
    });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};