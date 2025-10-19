const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "syncly-backend" });
});

app.get("/api/v1/info", (req, res) => {
  res.json({
    name: "Syncly API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

const domain = process.env.AUTH0_DOMAIN;
const audience = process.env.AUTH0_AUDIENCE;

const requireAuth = jwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${domain}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  }),
  audience: audience,
  issuer: `https://${domain}/`,
  algorithms: ["RS256"],
});

app.get("/secure/ping", requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: req.auth,
  });
});

app.listen(PORT, () => {
  console.log(`Syncly backend listening on port ${PORT}`);
});

// --- In-memory workflows store (replace later with DB/Supabase) --------------
let workflows = [
  {
    id: "w1",
    name: "Customer Onboarding",
    description: "Automated customer onboarding process",
    status: "active",
    progress: 75,
    tasks: 12,
    members: 5,
    lastUpdatedLabel: "2 hours ago",
    category: "Sales",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "w2",
    name: "Content Review Pipeline",
    description: "Multi-stage content review and approval",
    status: "active",
    progress: 60,
    tasks: 8,
    members: 3,
    lastUpdatedLabel: "5 hours ago",
    category: "Marketing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// --- Workflows API -----------------------------------------------------------
app.get("/api/v1/workflows", (req, res) => {
  res.json({ items: workflows, count: workflows.length });
});

app.post("/api/v1/workflows", requireAuth, (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: "name is required" });

  const now = new Date().toISOString();
  const item = {
    id: `w${Math.random().toString(36).slice(2, 7)}`,
    name: b.name,
    description: b.description || "",
    status: b.status || "active",
    progress: Number.isFinite(b.progress) ? b.progress : 0,
    tasks: Number.isFinite(b.tasks) ? b.tasks : 0,
    members: Number.isFinite(b.members) ? b.members : 1,
    lastUpdatedLabel: "just now",
    category: b.category || null,
    createdAt: now,
    updatedAt: now,
  };
  workflows.unshift(item);
  res.status(201).json(item);
});

app.patch("/api/v1/workflows/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const idx = workflows.findIndex((w) => w.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });

  const b = req.body || {};
  const now = new Date().toISOString();
  workflows[idx] = {
    ...workflows[idx],
    ...b,
    updatedAt: now,
    lastUpdatedLabel: "just now",
  };
  res.json(workflows[idx]);
});

app.delete("/api/v1/workflows/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const before = workflows.length;
  workflows = workflows.filter((w) => w.id !== id);
  if (workflows.length === before) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});
