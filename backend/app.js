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


// --- GitHub Integration -----------------------------------------------------------
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args)); // if not already installed

// GET /integrations/github/import?since=2025-10-01T00:00:00Z
app.get("/integrations/github/import", async (req, res) => {
  try {
    const since = req.query.since || new Date(Date.now() - 7*24*3600*1000).toISOString();
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    const workspaceId = process.env.WORKSPACE_ID || "demo";

    if (!repo || !token) return res.status(400).json({ error: "GITHUB_REPO and GITHUB_TOKEN required" });

    // 1) Issues (includes PRs as 'pull_request' field)
    const issuesResp = await fetch(`https://api.github.com/repos/${repo}/issues?state=all&since=${encodeURIComponent(since)}&per_page=50`, {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": "syncly-importer" },
    });
    if (!issuesResp.ok) throw new Error(`GitHub issues HTTP ${issuesResp.status}`);
    const issues = await issuesResp.json();

    // 2) Map to activity_events rows
    const rows = [];
    for (const it of issues) {
      const isPR = Boolean(it.pull_request);
      const type = isPR
        ? (it.state === "closed" && it.pull_request?.merged_at ? "pr_merged"
           : it.state === "closed" ? "pr_closed" : "pr_opened")
        : (it.state === "closed" ? "issue_closed" : "issue_opened");

      rows.push({
        workspace_id: workspaceId,
        provider: "github",
        type,
        title: it.title,
        description: it.body?.slice(0, 10000) || null,
        url: it.html_url,
        actor: it.user?.login || null,
        metadata: it, // raw payload
        occurred_at: it.updated_at || it.created_at || new Date().toISOString(),
      });

      // Optional: upsert task_status summary
      await supabase.from("task_status").upsert({
        workspace_id: workspaceId,
        provider: "github",
        external_id: String(it.number),
        title: it.title,
        status: it.state === "open" ? "open" : (isPR && it.pull_request?.merged_at ? "merged" : "closed"),
        assignee: it.assignee?.login || null,
        url: it.html_url,
        last_event_at: it.updated_at || it.created_at || null,
      }, { onConflict: "workspace_id,provider,external_id" });
    }

    // 3) Bulk insert activities
    if (rows.length) {
      const { error } = await supabase.from("activity_events").insert(rows);
      if (error) throw error;
    }

    res.json({ imported: rows.length, since });
  } catch (e) {
    console.error("[github import]", e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// GET /api/v1/activities
app.get("/api/v1/activities", async (req, res) => {
  const workspaceId = process.env.WORKSPACE_ID || "demo";
  const { data, error } = await supabase
    .from("activity_events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("occurred_at", { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ items: data || [], count: data?.length || 0 });
});

app.post("/notify/slack/digest", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("activity_events")
    .select("provider, type, title, url, actor, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });

  const blocks = (data || []).map(ev => `• *${ev.type}*: ${ev.title || "(no title)"} — _${ev.actor || "unknown"}_`).join("\n");

  const payload = {
    text: "Syncly Digest",
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: "*Syncly — Latest Activity*" } },
      { type: "section", text: { type: "mrkdwn", text: blocks || "No recent activity." } },
    ],
  };

  const resp = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) return res.status(500).json({ error: `Slack ${resp.status}` });
  res.json({ ok: true, sent: (data || []).length });
});


