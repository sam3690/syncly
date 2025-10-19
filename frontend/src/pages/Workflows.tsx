// frontend/src/pages/Workflows.tsx
import React, { useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter as FilterIcon, MoreVertical, Clock, Users, TrendingUp, X, Github, Slack, Trello, FileText, Settings, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useWorkflows } from "@/hooks/useWorkflows";
import type { Workflow } from "@/types/workflow";
import CreateWorkflowDialog from "@/components/CreateWorkflowDialog";
import { useAuth0 } from "@auth0/auth0-react";
import { useQueryClient } from "@tanstack/react-query";
import { createWorkflowAuth, updateWorkflowAuth, deleteWorkflowAuth } from "@/api/workflows";

// ---------- View model + helpers --------------------------------------------

type ViewStatus = "active" | "completed" | "paused";
type ViewPriority = "high" | "medium" | "low";

type ViewWorkflow = {
  id: string;
  name: string;
  description?: string;
  status: ViewStatus;
  progress: number;              // 0..100
  tasks: number;                 // optional metric
  members: number;               // optional metric
  lastUpdated?: string;          // ISO
  category?: string;             // e.g., Marketing, Engineering
  priority: ViewPriority;        // derived or supplied
};

function toViewModel(w: Workflow): ViewWorkflow {
  const a = w as any; // read optional fields if present later
  const derivedPriority: ViewPriority =
    w.completionRate >= 90 ? "low" : w.completionRate >= 50 ? "medium" : "high";

  return {
    id: w.id,
    name: w.name ?? "Untitled",
    description: a.description || undefined,
    status: (w.status as ViewStatus) ?? "active",
    progress: Math.max(0, Math.min(100, Math.round(w.completionRate ?? 0))),
    tasks: Number.isFinite(a.tasks) ? a.tasks : Math.floor((w.completionRate ?? 0) / 5), // placeholder
    members: Number.isFinite(a.members) ? a.members : Math.max(1, Math.round((w.completionRate ?? 0) / 15)),
    lastUpdated: w.updatedAt || w.createdAt,
    category: a.category, // optional
    priority: (a.priority as ViewPriority) || derivedPriority,
  };
}

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function getStatusColor(status: ViewStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "paused":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

// ---------- Page -------------------------------------------------------------

const Workflows: React.FC = () => {
  const { data, isLoading, isError, refetch, isFetching } = useWorkflows();
  const rows: ViewWorkflow[] = (data ?? []).map(toViewModel);

  // Search + filters
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [status, setStatus] = useState<"all" | ViewStatus>("all");
  const [priority, setPriority] = useState<"all" | ViewPriority>("all");
  const [category, setCategory] = useState<string>("all");

  // Integration dialog state
  const [selectedWorkflow, setSelectedWorkflow] = useState<ViewWorkflow | null>(null);
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [integrationForm, setIntegrationForm] = useState({
    platform: '',
    config: {} as any
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.category && set.add(r.category));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (priority !== "all" && r.priority !== priority) return false;
      if (category !== "all" && (r.category || "").toLowerCase() !== category.toLowerCase()) return false;

      if (!q) return true;
      const hay = [
        r.name,
        r.id,
        r.description || "",
        r.category || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, status, priority, category, query]);

  const qc = useQueryClient();
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    async function getTokenOrLogin() {
      if (!isAuthenticated) {
        await loginWithRedirect();
        return null;
      }
      return getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });
    }

    async function onEdit(wf: ViewWorkflow) {
      const newName = window.prompt("Rename workflow", wf.name);
      if (!newName || newName.trim() === wf.name) return;
      const token = await getTokenOrLogin();
      if (!token) return;
      await updateWorkflowAuth(wf.id, { name: newName.trim() }, token);
      await qc.invalidateQueries({ queryKey: ["workflows"] });
    }

    async function onDuplicate(wf: ViewWorkflow) {
      const token = await getTokenOrLogin();
      if (!token) return;
      await createWorkflowAuth(
        {
          name: `${wf.name} (Copy)`,
          description: wf.description,
          status: wf.status,
          progress: wf.progress ?? 0,
          category: wf.category,
          tasks: (wf as any).tasks,
          members: (wf as any).members,
        },
        token
      );
      await qc.invalidateQueries({ queryKey: ["workflows"] });
    }

    async function onArchive(wf: ViewWorkflow) {
      const token = await getTokenOrLogin();
      if (!token) return;
      // simple archive = set status to "paused"
      await updateWorkflowAuth(wf.id, { status: "paused" }, token);
      await qc.invalidateQueries({ queryKey: ["workflows"] });
    }

    async function onDelete(wf: ViewWorkflow) {
      if (!window.confirm(`Delete "${wf.name}"? This cannot be undone.`)) return;
      const token = await getTokenOrLogin();
      if (!token) return;
      await deleteWorkflowAuth(wf.id, token);
      await qc.invalidateQueries({ queryKey: ["workflows"] });
    }


  const clearAll = () => {
    setQuery("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          {/* Title + Create */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Workflows</h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor your automated workflows
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CreateWorkflowDialog />
            </div>
          </div>

          {/* Search + Filter controls */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search workflows by name, id or description…"
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowFilters((s) => !s)}
              >
                <FilterIcon className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Refreshing…" : "Refresh"}
              </Button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  title="Status"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  title="Priority"
                >
                  <option value="all">All priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  title="Category"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All categories" : c}
                    </option>
                  ))}
                </select>

                <Button variant="ghost" size="sm" className="ml-auto gap-1" onClick={clearAll}>
                  <X className="h-4 w-4" /> Clear
                </Button>
              </div>
            )}
          </div>

          {/* States */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading workflows…</div>
          ) : isError ? (
            <div className="text-sm text-destructive">Failed to load workflows.</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No workflows match your filters.</div>
          ) : (
            // Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((wf) => (
                <Card key={wf.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{wf.name}</CardTitle>
                        <CardDescription>
                          {wf.description || "—"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(wf)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(wf)}>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onArchive(wf)}>Archive</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(wf)} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getStatusColor(wf.status)}>
                        {wf.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{wf.category || "—"}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{wf.progress}%</span>
                      </div>
                      <Progress value={wf.progress} className="h-2" />
                    </div>

                    {/* Platform Integrations */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Integrations</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            setSelectedWorkflow(wf);
                            setIntegrationDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {(wf as any).workflow_integrations?.length > 0 ? (
                          (wf as any).workflow_integrations.map((integration: any) => (
                            <Badge key={integration.id} variant="secondary" className="text-xs px-2 py-1">
                              {integration.platform === 'github' && <Github className="h-3 w-3 mr-1" />}
                              {integration.platform === 'slack' && <Slack className="h-3 w-3 mr-1" />}
                              {integration.platform === 'trello' && <Trello className="h-3 w-3 mr-1" />}
                              {integration.platform === 'jira' && <FileText className="h-3 w-3 mr-1" />}
                              {integration.platform}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No integrations</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          <span>{wf.tasks}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{wf.members}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{timeAgo(wf.lastUpdated)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Integration Dialog */}
      <Dialog open={integrationDialogOpen} onOpenChange={setIntegrationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Platform Integration</DialogTitle>
            <DialogDescription>
              Connect {selectedWorkflow?.name} to external platforms for automated data sync.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={integrationForm.platform}
                onChange={(e) => setIntegrationForm({ platform: e.target.value, config: {} })}
                className="w-full h-9 rounded-md border bg-background px-3 text-sm mt-1"
              >
                <option value="">Select platform...</option>
                <option value="github">GitHub Repository</option>
                <option value="slack">Slack Channel</option>
                <option value="trello">Trello Board</option>
                <option value="jira">Jira Project</option>
              </select>
            </div>

            {integrationForm.platform === 'github' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="repo">Repository (owner/repo)</Label>
                  <Input
                    id="repo"
                    placeholder="e.g., facebook/react"
                    value={integrationForm.config.repo || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, repo: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="token">GitHub Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="ghp_..."
                    value={integrationForm.config.token || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, token: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            {integrationForm.platform === 'slack' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="webhook">Slack Webhook URL</Label>
                  <Input
                    id="webhook"
                    placeholder="https://hooks.slack.com/..."
                    value={integrationForm.config.webhook_url || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, webhook_url: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="channel">Channel Name</Label>
                  <Input
                    id="channel"
                    placeholder="#general"
                    value={integrationForm.config.channel || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, channel: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            {integrationForm.platform === 'trello' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="board">Board ID</Label>
                  <Input
                    id="board"
                    placeholder="Trello Board ID"
                    value={integrationForm.config.board_id || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, board_id: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={integrationForm.config.api_key || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, api_key: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="trelloToken">Token</Label>
                  <Input
                    id="trelloToken"
                    type="password"
                    value={integrationForm.config.token || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, token: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            {integrationForm.platform === 'jira' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="domain">Jira Domain</Label>
                  <Input
                    id="domain"
                    placeholder="yourcompany.atlassian.net"
                    value={integrationForm.config.domain || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, domain: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="project">Project Key</Label>
                  <Input
                    id="project"
                    placeholder="PROJ"
                    value={integrationForm.config.project_key || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, project_key: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={integrationForm.config.email || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, email: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="apiToken">API Token</Label>
                  <Input
                    id="apiToken"
                    type="password"
                    value={integrationForm.config.api_token || ''}
                    onChange={(e) => setIntegrationForm({
                      ...integrationForm,
                      config: { ...integrationForm.config, api_token: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={async () => {
                  if (!selectedWorkflow || !integrationForm.platform) return;
                  
                  try {
                    const token = await getTokenOrLogin();
                    if (!token) return;

                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/workflows/${selectedWorkflow.id}/integrations`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(integrationForm)
                    });

                    if (response.ok) {
                      setIntegrationDialogOpen(false);
                      setIntegrationForm({ platform: '', config: {} });
                      await qc.invalidateQueries({ queryKey: ["workflows"] });
                    }
                  } catch (error) {
                    console.error('Failed to add integration:', error);
                  }
                }}
                disabled={!integrationForm.platform || Object.keys(integrationForm.config).length === 0}
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Connect
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIntegrationDialogOpen(false);
                  setIntegrationForm({ platform: '', config: {} });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workflows;
