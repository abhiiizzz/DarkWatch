const axios = require("axios");
const Website = require("../models/Website");
const nodemailer = require("nodemailer"); // for email alerts

// Configure email transporter (update these settings and credentials in .env)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "pdandapat@gmail.com",
    pass: "nsfi ufsr deui wavp",
  },
});

const sendAlertEmail = async (website) => {
  const mailOptions = {
    from: '"DarkWatch"<pdandapat@gmail.com>',
    to: website.alertEmail, 
    subject: `Alert: ${website.url} might be under attack or is down`,
    text: `Our monitoring system detected that ${website.url} is down. Please investigate immediately.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Alert email sent for ${website.url}`);
  } catch (error) {
    console.error(`Error sending email for ${website.url}:`, error.message);
  }
};

const checkWebsite = async (website) => {
  const startTime = Date.now();
  let status = "down";
  let responseTime = 0;

  try {
    const response = await axios.get(website.url, { timeout: 10000 });
    responseTime = Date.now() - startTime;
    // Accept any success status in the 200-299 range
    status = response.status >= 200 && response.status < 300 ? "up" : "down";
    console.log(`Checked ${website.url}: ${status} in ${responseTime}ms`);
  } catch (error) {
    responseTime = Date.now() - startTime;
    console.error(`Error checking ${website.url}:`, error.message);
    status = "down";
  }

  // Update website document
  website.lastChecked = new Date();
  website.status = status;
  website.responseTime = responseTime;
  website.logs.push({ checkedAt: new Date(), status, responseTime });

  // For demonstration: if website is down for 3 consecutive checks, flag as "suspicious" and send an alert.
  // (You may need to adjust this logic as per your application's requirement)
  const downCount = website.logs.filter((log) => log.status === "down").length;
  if (downCount >= 3 && website.alertEmail) {
    await sendAlertEmail(website);
  }

  await website.save();

  // Emit real-time update using Socket.io. Get io instance from app locals.
  const io = require("../server").io || website.io || null; // Alternatively, pass io through a module export
  // If we can't import io directly, you can use a global variable or other pattern.
  // Here we assume you've attached io to app in server.js and can access it via require cache:
  if (io) {
    io.emit("websiteUpdate", {
      id: website._id,
      url: website.url,
      status,
      lastChecked: website.lastChecked,
      responseTime,
    });
  }
};

const runMonitoring = async () => {
  try {
    const websites = await Website.find();
    for (let website of websites) {
      await checkWebsite(website);
    }
    console.log("Monitoring cycle completed.");
  } catch (error) {
    console.error("Monitoring error:", error);
  }
};

module.exports = { runMonitoring };
