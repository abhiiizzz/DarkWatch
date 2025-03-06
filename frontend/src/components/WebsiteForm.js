import React, { useState } from "react";
import API from "../services/api";
import { TextField, Button, Box } from "@mui/material";

const WebsiteForm = ({ onWebsiteAdded }) => {
  const [url, setUrl] = useState("");
  const [checkInterval, setCheckInterval] = useState(5);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/websites", { url, checkInterval });
      setUrl("");
      onWebsiteAdded();
    } catch (err) {
      setError("Failed to add website");
      console.error(err);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ my: 4 }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <TextField
        label="Website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Check Interval (minutes)"
        type="number"
        value={checkInterval}
        onChange={(e) => setCheckInterval(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Add Website
      </Button>
    </Box>
  );
};

export default WebsiteForm;
