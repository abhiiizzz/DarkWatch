// src/components/WebsiteList.js
import React from "react";
import API from "../services/api";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const WebsiteList = ({ websites, onChange, onSelect }) => {
  const deleteWebsite = async (id) => {
    try {
      await API.delete(`/websites/${id}`);
      onChange();
    } catch (err) {
      console.error("Error deleting website", err);
    }
  };

  return (
    <List>
      {websites.map((site) => (
        <React.Fragment key={site._id}>
          <ListItem
            button
            onClick={() => onSelect(site._id)}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteWebsite(site._id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={site.url}
              secondary={`Last Checked: ${
                site.lastChecked
                  ? new Date(site.lastChecked).toLocaleString()
                  : "Never"
              } - Status: ${site.status}`}
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};

export default WebsiteList;
