// src/components/MonitoringChart.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Box, Typography } from "@mui/material";
import API from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MonitoringChart = ({ websiteId }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get(`/websites/${websiteId}/logs`);
        const logs = res.data;
        // Sort logs by check time (oldest first)
        logs.sort((a, b) => new Date(a.checkedAt) - new Date(b.checkedAt));
        // Use check time as labels (converted to local time string)
        const labels = logs.map((log) =>
          new Date(log.checkedAt).toLocaleTimeString()
        );
        // Use responseTime as data points
        const dataPoints = logs.map((log) => log.responseTime);

        setChartData({
          labels,
          datasets: [
            {
              label: "Response Time (ms)",
              data: dataPoints,
              fill: false,
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba(75,192,192,1)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    if (websiteId) {
      fetchLogs();
    }
  }, [websiteId]);

  if (!chartData) return <Typography>Loading chart...</Typography>;

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" gutterBottom>
        Uptime & Response Time History
      </Typography>
      <Line data={chartData} />
    </Box>
  );
};

export default MonitoringChart;
