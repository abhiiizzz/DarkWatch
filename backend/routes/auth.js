// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const User = require("../models/User");

dotenv.config();

// Log the credentials (for debugging only - remove in production)
// console.log("SMTP_USER:", process.env.SMTP_USER);
// console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD);

// Configure Nodemailer transporter using your SMTP settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "pdandapat@gmail.com",
    pass: "nsfi ufsr deui wavp",
  },
});

// Function to send a login notification email
const sendLoginEmail = async (userEmail, username) => {
  const mailOptions = {
    from: '"DarkWatch"<pdandapat@gmail.com>',
    to: userEmail,
    subject: "Login Notification",
    text: `Hello ${username},
        We noticed that you just logged into your account. If this was you, you can safely ignore this message.
        If you suspect any unauthorized access, please contact our support immediately.
        Best regards,
        The Monitoring App Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Login notification email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending login email to ${userEmail}:`, error.message);
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user and send a welcome email (if desired)
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Optionally, you could send a welcome email here

    const payload = { user: { id: user._id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user, send a login notification email, and return token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    // Send a login notification email

    await sendLoginEmail(user.email, user.username);

    const payload = { user: { id: user._id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
