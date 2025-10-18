const express = require("express");

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "syncly-backend" });
});

app.get("/api/v1/info", (_req, res) => {
  res.status(200).json({
    name: "Syncly API",
    version: process.env.npm_package_version || "dev",
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` });
});

app.listen(port, () => {
  // Lightweight runtime log to confirm server boot
  console.log(`Syncly backend listening on port ${port}`);
});
