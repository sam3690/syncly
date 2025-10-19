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


// --- Workflows API -----------------------------------------------------------
const { supabase } = require("./supabase");

/* LIST: GET /api/v1/workflows  (public) */
app.get("/api/v1/workflows", async (req, res) => {
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ items: data || [], count: data?.length || 0 });
});

/* CREATE: POST /api/v1/workflows  (protected) */
app.post("/api/v1/workflows", requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: "name is required" });

  // Attach creator (Auth0 sub) for future ownership logic
  const created_by = req.auth?.sub || null;

  const { data, error } = await supabase
    .from("workflows")
    .insert([{
      name: b.name,
      description: b.description || "",
      status: b.status || "active",
      progress: Number.isFinite(b.progress) ? b.progress : 0,
      tasks: Number.isFinite(b.tasks) ? b.tasks : 0,
      members: Number.isFinite(b.members) ? b.members : 1,
      category: b.category || null,
      last_updated_label: b.lastUpdatedLabel || "just now",
      created_by
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

/* UPDATE: PATCH /api/v1/workflows/:id  (protected) */
app.patch("/api/v1/workflows/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const patch = req.body || {};

  const { data, error } = await supabase
    .from("workflows")
    .update({
      name: patch.name,
      description: patch.description,
      status: patch.status,
      progress: patch.progress,
      tasks: patch.tasks,
      members: patch.members,
      category: patch.category,
      last_updated_label: patch.lastUpdatedLabel || "just now",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return res.status(404).json({ error: "not found" });
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

/* DELETE: DELETE /api/v1/workflows/:id  (protected) */
app.delete("/api/v1/workflows/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("workflows").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});
