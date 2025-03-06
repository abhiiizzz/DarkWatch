// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http"); // for creating HTTP server
const socketio = require("socket.io");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/websites", require("./routes/websites"));

// Test route for connectivity
app.get("/api/ping", (req, res) => res.json({ message: "pong" }));

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

// Make Socket.io instance accessible to other modules via app locals.
app.set("io", io);

// Start the background scheduler (monitoring cycle)
require("./scheduler/monitorScheduler");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Log client connections/disconnections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// Export io so that it can be used in other modules
module.exports = { app, io };
