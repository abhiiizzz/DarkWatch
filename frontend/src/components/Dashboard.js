// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Container, Typography, Button, Box } from "@mui/material";
import WebsiteList from "./WebsiteList";
import WebsiteForm from "./WebsiteForm";
import MonitoringChart from "./MonitoringChart";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const Dashboard = () => {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  // Fetch websites for the logged-in user
  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const res = await API.get("/websites");
        setWebsites(res.data);
        // Automatically select the first website if available
        if (res.data.length && !selectedWebsiteId) {
          setSelectedWebsiteId(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchWebsites();
  }, [refresh, selectedWebsiteId]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("websiteUpdate", (data) => {
      setWebsites((prev) =>
        prev.map((site) => (site._id === data.id ? { ...site, ...data } : site))
      );
    });
    return () => socket.disconnect();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="outlined" color="secondary" onClick={logout}>
          Logout
        </Button>
      </Box>

      <WebsiteForm onWebsiteAdded={() => setRefresh(!refresh)} />
      <WebsiteList
        websites={websites}
        onChange={() => setRefresh(!refresh)}
        onSelect={(id) => setSelectedWebsiteId(id)}
      />

      {selectedWebsiteId && <MonitoringChart websiteId={selectedWebsiteId} />}
    </Container>
  );
};

export default Dashboard;
