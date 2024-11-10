const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.listen(process.env.PORT, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server Started Successfully.");
  }
});

mongoose
  .connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

// app.use(
//   cors({
//     origin: ["http://localhost:60280"],
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );
app.use(cookieParser());
app.use(
  cors({
    origin: "*", // Allows requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify the allowed methods
    credentials: true, // Enable credentials (cookies, etc.)
  })
);


app.use(express.json());
app.use("/", authRoutes);
