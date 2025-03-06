const cron = require("node-cron");
const { runMonitoring } = require("../services/monitorService");

// Schedule the monitoring task to run every 5 minutes.
// You could adjust this based on your needs.
cron.schedule("*/5 * * * *", async () => {
  console.log("Starting monitoring cycle...");
  await runMonitoring();
});
