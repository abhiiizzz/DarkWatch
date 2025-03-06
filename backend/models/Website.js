// models/Website.js
const mongoose = require("mongoose");

const WebsiteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    checkInterval: { type: Number, default: 5 }, // in minutes
    lastChecked: { type: Date },
    status: { type: String, default: "unknown" },
    responseTime: { type: Number, default: 0 },
    logs: [
      {
        checkedAt: { type: Date, default: Date.now },
        status: { type: String },
        responseTime: { type: Number },
      },
    ],
    alertEmail: { type: String }, // Email to send alerts (set automatically from user email)
    vulnerabilityScan: { type: String }, // To store Nmap scan results
  },
  { timestamps: true }
);

module.exports = mongoose.model("Website", WebsiteSchema);
