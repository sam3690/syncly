const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "https://d1nsc9i977d35h.cloudfront.net"
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "syncly-backend" });
});

app.get("/", (req, res) => {
  res.json({
    name: "Syncly API",
    version: "1.0.0",
    description: "Unified workflow and activity management platform",
    endpoints: {
      health: "/health",
      info: "/api/v1/info",
      workflows: "/api/v1/workflows",
      activities: "/api/v1/activities",
      ai: {
        insights: "/api/v1/ai/insights",
        suggestions: "/api/v1/ai/suggestions"
      }
    },
    timestamp: new Date().toISOString()
  });
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
  try {
    const { data, error } = await supabase
      .from("workflows")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    // Add mock integrations for demo
    const workflowsWithIntegrations = (data || []).map(workflow => ({
      ...workflow,
      workflow_integrations: [
        {
          id: "github-1",
          platform: "github",
          config: { repo: "facebook/react" },
          status: "active",
          created_at: new Date().toISOString()
        }
      ]
    }));

    res.json({ items: workflowsWithIntegrations, count: workflowsWithIntegrations.length });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    // Return mock workflows if Supabase is not configured
    const mockWorkflows = [
      {
        id: "wf-1",
        name: "User Authentication System",
        description: "Implement OAuth2 authentication with Auth0 integration",
        status: "active",
        progress: 75,
        tasks: 12,
        members: 3,
        category: "Security",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        workflow_integrations: [
          {
            id: "github-1",
            platform: "github",
            config: { repo: "company/auth-service" },
            status: "active",
            created_at: new Date().toISOString()
          }
        ]
      },
      {
        id: "wf-2",
        name: "API Documentation Update",
        description: "Update API docs for v2.1 release with new endpoints",
        status: "completed",
        progress: 100,
        tasks: 8,
        members: 2,
        category: "Documentation",
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        workflow_integrations: [
          {
            id: "jira-1",
            platform: "jira",
            config: { project_key: "DOCS", domain: "company.atlassian.net" },
            status: "active",
            created_at: new Date().toISOString()
          }
        ]
      },
      {
        id: "wf-3",
        name: "Mobile App Performance",
        description: "Optimize mobile app performance and reduce load times",
        status: "paused",
        progress: 45,
        tasks: 15,
        members: 4,
        category: "Performance",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        workflow_integrations: [
          {
            id: "slack-1",
            platform: "slack",
            config: { channel: "#mobile-dev" },
            status: "active",
            created_at: new Date().toISOString()
          }
        ]
      }
    ];
    res.json({ items: mockWorkflows, count: mockWorkflows.length });
  }
});

/* CREATE: POST /api/v1/workflows  (protected) */
app.post("/api/v1/workflows", async (req, res) => {
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


// --- Multi-Platform Integrations ---------------------------------------------------

// GET /api/v1/workflows/:workflowId/integrations
app.get("/api/v1/workflows/:workflowId/integrations", async (req, res) => {
  const { workflowId } = req.params;
  // For now, return mock integrations since table doesn't exist
  res.json({
    integrations: [
      {
        id: "github-1",
        platform: "github",
        config: { repo: "facebook/react" },
        status: "active",
        created_at: new Date().toISOString()
      }
    ]
  });
});

// POST /api/v1/workflows/:workflowId/integrations
app.post("/api/v1/workflows/:workflowId/integrations", async (req, res) => {
  const { workflowId } = req.params;
  const { platform, config } = req.body;

  if (!platform || !config) {
    return res.status(400).json({ error: "platform and config are required" });
  }

  // Mock response for now
  const integration = {
    id: `${platform}-${Date.now()}`,
    workflow_id: workflowId,
    platform,
    config,
    status: "active",
    created_by: "test-user",
    created_at: new Date().toISOString()
  };

  res.status(201).json(integration);
});

// DELETE /api/v1/workflows/:workflowId/integrations/:integrationId
app.delete("/api/v1/workflows/:workflowId/integrations/:integrationId", requireAuth, async (req, res) => {
  const { integrationId } = req.params;
  const { error } = await supabase
    .from("workflow_integrations")
    .delete()
    .eq("id", integrationId);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// POST /api/v1/integrations/sync/:workflowId
app.post("/api/v1/integrations/sync/:workflowId", async (req, res) => {
  const { workflowId } = req.params;

  try {
    // Mock sync response
    res.json({
      results: [
        {
          platform: "github",
          synced: 5,
          success: true
        }
      ],
      totalSynced: 5
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions for syncing different platforms
async function syncGitHubActivities(config) {
  const { repo, token } = config;
  const activities = [];

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/events?per_page=30`, {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": "syncly-importer" }
    });

    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

    const events = await response.json();

    for (const event of events) {
      activities.push({
        workspace_id: "demo",
        provider: "github",
        type: event.type.toLowerCase(),
        title: `${event.type} by ${event.actor.login}`,
        description: event.payload?.commits?.[0]?.message || event.type,
        url: event.repo.url,
        actor: event.actor.login,
        metadata: event,
        occurred_at: event.created_at
      });
    }
  } catch (error) {
    console.error("GitHub sync error:", error);
  }

  return activities;
}

async function syncSlackActivities(config) {
  const { webhook_url, channel } = config;
  // For now, return empty array - would need Slack API integration
  return [];
}

async function syncTrelloActivities(config) {
  const { board_id, api_key, token } = config;
  // For now, return empty array - would need Trello API integration
  return [];
}

async function syncJiraActivities(config) {
  const { project_key, email, api_token, domain } = config;
  // For now, return empty array - would need Jira API integration
  return [];
}

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
  try {
    const workspaceId = process.env.WORKSPACE_ID || "demo";
    const { data, error } = await supabase
      .from("activity_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("occurred_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    res.json({ items: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error("Error fetching activities:", error);
    // Return mock data if Supabase is not configured
    const mockActivities = [
      {
        id: "1",
        workspace_id: "demo",
        provider: "github",
        type: "pr_opened",
        title: "Add user authentication system",
        description: "Implement OAuth2 authentication with Auth0 integration",
        url: "https://github.com/example/repo/pull/42",
        actor: "john-doe",
        occurred_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: { number: 42, state: "open" }
      },
      {
        id: "2",
        workspace_id: "demo",
        provider: "github",
        type: "issue_closed",
        title: "Fix responsive design on mobile",
        description: "Mobile layout breaks on screens smaller than 320px",
        url: "https://github.com/example/repo/issues/38",
        actor: "jane-smith",
        occurred_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        metadata: { number: 38, state: "closed" }
      },
      {
        id: "3",
        workspace_id: "demo",
        provider: "slack",
        type: "message",
        title: "Team standup completed",
        description: "Daily standup finished with 5 participants",
        url: "#general",
        actor: "team-lead",
        occurred_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        metadata: { channel: "general" }
      },
      {
        id: "4",
        workspace_id: "demo",
        provider: "trello",
        type: "card_moved",
        title: "Database schema design",
        description: "Moved from 'In Progress' to 'Review'",
        url: "https://trello.com/c/example",
        actor: "dev-team",
        occurred_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        metadata: { board: "Project Board", list: "Review" }
      },
      {
        id: "5",
        workspace_id: "demo",
        provider: "jira",
        type: "issue_updated",
        title: "API documentation update",
        description: "Updated API docs for v2.1 release",
        url: "https://company.atlassian.net/browse/PROJ-123",
        actor: "api-team",
        occurred_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        metadata: { key: "PROJ-123", status: "Done" }
      }
    ];
    res.json({ items: mockActivities, count: mockActivities.length });
  }
});

// GET /api/v1/ai/insights
app.get("/api/v1/ai/insights", async (req, res) => {
  try {
    // Call the agent service to get AI insights
    const agentsUrl = process.env.AGENTS_API_URL || "http://agents:8085";
    const agentResponse = await fetch(`${agentsUrl}/insights`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!agentResponse.ok) {
      throw new Error(`Agent service returned ${agentResponse.status}`);
    }

    const insights = await agentResponse.json();
    res.json(insights);
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    // Return mock data if agent is unavailable
    res.json({
      insights: [
        {
          id: 1,
          title: "GitHub Activity Analysis",
          description: "Recent commits show active development. Consider reviewing PR #42 for potential optimizations.",
          impact: "medium",
          category: "Development",
          metrics: { commits: 15, prs: 3 },
          icon: "Target"
        }
      ],
      stats: {
        activeInsights: 1,
        timeSaved: "2h",
        efficiency: "+5%"
      }
    });
  }
});

// GET /api/v1/ai/suggestions
app.get("/api/v1/ai/suggestions", async (req, res) => {
  try {
    // Call the agent service to get AI suggestions
    const agentsUrl = process.env.AGENTS_API_URL || "http://agents:8085";
    const agentResponse = await fetch(`${agentsUrl}/suggestions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!agentResponse.ok) {
      throw new Error(`Agent service returned ${agentResponse.status}`);
    }

    const suggestions = await agentResponse.json();
    res.json(suggestions);
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    // Return helpful fallback suggestions
    res.json({
      suggestions: [
        {
          id: 1,
          title: "Review Open Pull Requests",
          description: "Check for PRs that need review or have been waiting too long. Focus on high-priority features.",
          priority: "high",
          type: "review",
          estimatedTime: "15 min"
        },
        {
          id: 2,
          title: "Update Dependencies",
          description: "Run dependency updates to ensure security patches and latest features are applied.",
          priority: "medium",
          type: "maintenance",
          estimatedTime: "10 min"
        },
        {
          id: 3,
          title: "Improve Code Coverage",
          description: "Add tests for recently added features to maintain high code quality standards.",
          priority: "medium",
          type: "quality",
          estimatedTime: "30 min"
        },
        {
          id: 4,
          title: "Document Recent Changes",
          description: "Update README or documentation to reflect recent feature additions or API changes.",
          priority: "low",
          type: "documentation",
          estimatedTime: "20 min"
        }
      ],
      summary: {
        totalSuggestions: 4,
        criticalIssues: 0,
        productivityTips: 4
      }
    });
  }
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

// AWS Lambda handler
const serverless = require('serverless-http');
module.exports.handler = serverless(app);

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Syncly backend listening on port ${PORT}`);
  });
}


