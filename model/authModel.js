const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: [true, "Username is Required"],
  },
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique : true
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
  },
  mobile: {
    type: String,
    required: [true, "Mobile Number is Required"],
    unique: false,
  },
  otp: {
    type : String
  },
  otpExpiry: {
    type : Date,
  } 
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("incorrect email address"); // Throw error if mobile number is incorrect
  }
  
  // Check if the provided password is correct
  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    throw new Error("incorrect password"); // Throw error if password is incorrect
  }

  return user;
};

module.exports = mongoose.model("Users", userSchema);
