// backend/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// If your Node < 18, install: npm i node-fetch@3
const _fetch =
  global.fetch ||
  ((...args) => import("node-fetch").then(({ default: f }) => f(...args)));

// -----------------------------------------------------
// Core + CORS + JSON
// -----------------------------------------------------
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    credentials: true,
  })
);
app.use(express.json());

// -----------------------------------------------------
// Health & Info
// -----------------------------------------------------
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

// -----------------------------------------------------
// Auth0
// -----------------------------------------------------
const domain = process.env.AUTH0_DOMAIN;
const audience = process.env.AUTH0_AUDIENCE;

const requireAuth = jwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${domain}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  }),
  audience,
  issuer: `https://${domain}/`,
  algorithms: ["RS256"],
});

app.get("/secure/ping", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.auth });
});

// -----------------------------------------------------
// Supabase client
// -----------------------------------------------------
const { supabase } = require("./supabase");

// -----------------------------------------------------
// Workflows API
// -----------------------------------------------------

// LIST (public)
app.get("/api/v1/workflows", async (req, res) => {
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ items: data || [], count: data?.length || 0 });
});

// CREATE (protected)
app.post("/api/v1/workflows", requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: "name is required" });

  const created_by = req.auth?.sub || null;

  const { data, error } = await supabase
    .from("workflows")
    .insert([
      {
        name: b.name,
        description: b.description || "",
        status: b.status || "active",
        progress: Number.isFinite(b.progress) ? b.progress : 0,
        tasks: Number.isFinite(b.tasks) ? b.tasks : 0,
        members: Number.isFinite(b.members) ? b.members : 1,
        category: b.category || null,
        last_updated_label: b.lastUpdatedLabel || "just now",
        created_by,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// UPDATE (protected)
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
    if (error.code === "PGRST116")
      return res.status(404).json({ error: "not found" });
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// DELETE (protected)
app.delete("/api/v1/workflows/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("workflows").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// -----------------------------------------------------
// GitHub Importer (public during dev; add requireAuth if you want)
// - Groups by issue/PR (owner/repo#number) or repo
// -----------------------------------------------------
app.get("/integrations/github/import", async (req, res) => {
  try {
    const repo = (req.query.repo || process.env.GITHUB_REPO || "").trim(); // e.g. anthropics/claude-cookbooks
    const since =
      req.query.since ||
      new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const ghToken = process.env.GITHUB_TOKEN || "";
    const workspaceId = process.env.WORKSPACE_ID || "demo";

    if (!repo || !repo.includes("/")) {
      return res
        .status(400)
        .json({ error: "GITHUB_REPO not set or invalid (expected owner/repo)" });
    }
    const [owner, repoName] = repo.split("/");

    const gh = async (path) => {
      const r = await _fetch(`https://api.github.com${path}`, {
        headers: {
          "User-Agent": "syncly-importer",
          ...(ghToken ? { Authorization: `Bearer ${ghToken}` } : {}),
          Accept: "application/vnd.github+json",
        },
      });
      if (!r.ok) throw new Error(`GitHub HTTP ${r.status} ${path}`);
      return r.json();
    };

    // Issues API returns both issues and PRs (PRs have pull_request)
    const items = await gh(
      `/repos/${repo}/issues?state=all&since=${encodeURIComponent(
        since
      )}&per_page=50`
    );

    const rows = [];
    for (const it of items) {
      const isPR = Boolean(it.pull_request);
      const type = isPR
        ? it.state === "closed" && it.pull_request?.merged_at
          ? "pr_merged"
          : it.state === "closed"
          ? "pr_closed"
          : "pr_opened"
        : it.state === "closed"
        ? "issue_closed"
        : "issue_opened";

      const hasNumber = Number.isFinite(it.number);
      const context_type = hasNumber
        ? isPR
          ? "github:pr"
          : "github:issue"
        : "github:repo";
      const context_id = hasNumber
        ? `${owner}/${repoName}#${it.number}`
        : `${owner}/${repoName}`;
      const context_label = hasNumber
        ? `${repoName} #${it.number}: ${it.title}`
        : `${owner}/${repoName}`;

      rows.push({
        workspace_id: workspaceId,
        provider: "github",
        type,
        title: it.title,
        description: it.body?.slice(0, 10000) || null,
        url: it.html_url,
        actor: it.user?.login || null,
        metadata: it,
        occurred_at:
          it.updated_at || it.created_at || new Date().toISOString(),
        context_type,
        context_id,
        context_label,
      });
    }

    if (rows.length) {
      const { error } = await supabase.from("activity_events").insert(rows);
      if (error) throw error;
    }

    res.json({ imported: rows.length, repo, since });
  } catch (e) {
    console.error("[github import]", e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

// -----------------------------------------------------
// Activity list (public)
// -----------------------------------------------------
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

// -----------------------------------------------------
// Slack digest via Incoming Webhook (protected)
// -----------------------------------------------------
app.post("/notify/slack/digest", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("activity_events")
    .select("provider, type, title, url, actor, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });

  const blocks = (data || [])
    .map(
      (ev) =>
        `• *${ev.type}*: ${ev.title || "(no title)"} — _${ev.actor || "unknown"}_`
    )
    .join("\n");

  const resp = await _fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "Syncly Digest",
      blocks: [
        { type: "section", text: { type: "mrkdwn", text: "*Syncly — Latest Activity*" } },
        { type: "section", text: { type: "mrkdwn", text: blocks || "No recent activity." } },
      ],
    }),
  });

  if (!resp.ok) return res.status(500).json({ error: `Slack ${resp.status}` });
  res.json({ ok: true, sent: (data || []).length });
});

// -----------------------------------------------------
// Slack importer (public during dev; add requireAuth if you want)
// - Groups by thread (channel:thread_ts) else by channel
// -----------------------------------------------------
async function slack(method, params, token) {
  const q = new URLSearchParams(params).toString();
  const r = await _fetch(`https://slack.com/api/${method}?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.json();
}

app.get("/integrations/slack/import", async (req, res) => {
  try {
    const token = process.env.SLACK_BOT_TOKEN;
    const channel = req.query.channel || process.env.SLACK_CHANNEL_ID;
    const oldest =
      req.query.oldest ||
      String((Date.now() - 7 * 24 * 3600 * 1000) / 1000);
    const limit = Number(req.query.limit || 100);
    const wsId = process.env.WORKSPACE_ID || "demo";

    if (!token || !channel) {
      return res.status(400).json({ error: "SLACK_BOT_TOKEN or channel missing" });
    }

    // ensure bot is in channel
    let hist = await slack("conversations.history", { channel, oldest, limit }, token);
    if (!hist.ok && hist.error === "not_in_channel") {
      const joined = await slack("conversations.join", { channel }, token);
      if (!joined.ok) throw new Error(`join failed: ${joined.error}`);
      hist = await slack("conversations.history", { channel, oldest, limit }, token);
    }
    if (!hist.ok) throw new Error(`Slack history error: ${hist.error}`);

    // channel label
    const cinfo = await slack("conversations.info", { channel }, token);
    const channelName = cinfo?.ok ? (cinfo.channel?.name || channel) : channel;

    const rows = [];
    const userCache = new Map();

    for (const m of hist.messages || []) {
      if (!m.text) continue;

      // actor
      let actor = "bot";
      if (m.user) {
        if (!userCache.has(m.user)) {
          const u = await slack("users.info", { user: m.user }, token);
          userCache.set(
            m.user,
            u.ok ? (u.user.profile?.real_name || u.user.name || m.user) : m.user
          );
        }
        actor = userCache.get(m.user);
      }

      // context
      const isThread = Boolean(m.thread_ts);
      const context_type = isThread ? "slack:thread" : "slack:channel";
      const context_id = isThread ? `${channel}:${m.thread_ts}` : channel;
      const context_label = isThread
        ? `#${channelName} • thread ${m.thread_ts}`
        : `#${channelName}`;

      rows.push({
        workspace_id: wsId,
        provider: "slack",
        type: "message",
        title: m.text.slice(0, 140),
        description: m.text,
        url: null,
        actor,
        metadata: m,
        occurred_at: new Date(
          Number((m.ts || "0").split(".")[0]) * 1000
        ).toISOString(),
        context_type,
        context_id,
        context_label,
      });
    }

    if (rows.length) {
      const { error } = await supabase.from("activity_events").insert(rows);
      if (error) throw error;
    }

    res.json({ imported: rows.length, channel, oldest, limit });
  } catch (e) {
    console.error("[slack import]", e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

// -----------------------------------------------------
// Start server
// -----------------------------------------------------
app.listen(PORT, () => {
  console.log(`Syncly backend listening on port ${PORT}`);
});
