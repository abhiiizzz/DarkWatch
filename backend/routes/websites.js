// routes/websites.js
const express = require("express");
const router = express.Router();
const Website = require("../models/Website");
const User = require("../models/User"); // For fetching user details
const auth = require("../middleware/auth");

// @route   POST /api/websites
// @desc    Add a new website to monitor (alertEmail set to logged-in user's email)
// @access  Private
router.post("/", auth, async (req, res) => {
  const { url, checkInterval } = req.body;

  // Validate that URL starts with http:// or https://
  if (!/^https?:\/\//.test(url)) {
    return res
      .status(400)
      .json({ message: "URL must start with http:// or https://" });
  }

  try {
    // Fetch the logged-in user's details
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create a new Website record with alertEmail set to user's email
    const website = new Website({
      user: req.user.id,
      url,
      checkInterval: checkInterval || 5,
      alertEmail: user.email, // Use the user's email for alerts
    });

    await website.save();
    res.json(website);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/websites
// @desc    Get all websites for logged-in user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const websites = await Website.find({ user: req.user.id });
    res.json(websites);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// @route   DELETE /api/websites/:id
// @desc    Delete a website
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) return res.status(404).json({ message: "Website not found" });
    if (website.user.toString() !== req.user.id)
      return res.status(401).json({ message: "User not authorized" });

    await website.remove();
    res.json({ message: "Website removed" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/websites/:id/logs
// @desc    Get logs for a specific website (for charts/analytics)
// @access  Private
router.get("/:id/logs", auth, async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) return res.status(404).json({ message: "Website not found" });
    res.json(website.logs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
