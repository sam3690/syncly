// frontend/src/components/WorkflowTable.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Clock } from "lucide-react";
import { useWorkflows } from "@/hooks/useWorkflows";
import type { Workflow } from "@/types/workflow";

// ---- UI helpers -------------------------------------------------------------

type ViewStatus = "active" | "completed" | "paused";
type ViewPriority = "high" | "medium" | "low";

type ViewWorkflow = {
  id: string;
  name: string;
  status: ViewStatus;
  progress: number; // 0..100
  assignee: string;
  dueDate?: string; // ISO or human label
  priority: ViewPriority;
  // extra structuring (optional)
  category?: string; // e.g., "Marketing", "Ops"
  tags?: string[];   // e.g., ["launch", "q4"]
};

const statusConfig: Record<ViewStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-primary/10 text-primary border-primary/20" },
  completed: { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  paused: { label: "Paused", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

const priorityConfig: Record<ViewPriority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { label: "Medium", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // already human
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ---- Mapping: Domain Workflow -> ViewWorkflow -------------------------------
// Our domain type (from /types/workflow.ts) may not have dueDate/priority/tags yet.
// This mapper lets us keep your UI shape while our backend evolves.
function toViewModel(w: Workflow): ViewWorkflow {
  const a = w as Workflow & {
    dueDate?: string;
    priority?: ViewPriority;
    category?: string;
    tags?: string[];
    tasks?: number;
    members?: number;
    lastUpdatedLabel?: string;
    progress?: number;
  };
  const pct = Number.isFinite(a.progress) ? a.progress : (w.completionRate ?? 0);
  const derivedPriority: ViewPriority =
    pct >= 90 ? "low" : pct >= 50 ? "medium" : "high";

  return {
    id: String(w.id),
    name: w.name ?? "Untitled",
    status: (w.status as ViewStatus) ?? "active",
    progress: Math.max(0, Math.min(100, Math.round(pct))),
    assignee: w.owner ?? "Unassigned",
    dueDate: a.dueDate || w.updatedAt || w.createdAt,
    priority: (a.priority as ViewPriority) || derivedPriority,
    category: a.category,
    tags: Array.isArray(a.tags) ? a.tags.slice(0, 6) : undefined,

    // extra: show tasks/members/lastUpdated in table, too
    // (we’ll render them in added columns below)
    // @ts-expect-error extend view model on the fly
    tasks: Number.isFinite(a.tasks) ? a.tasks : undefined,
    members: Number.isFinite(a.members) ? a.members : undefined,
    lastUpdatedLabel: a.lastUpdatedLabel,
  };
}


// ---- Component --------------------------------------------------------------

export function WorkflowTable() {
  const { data, isLoading, isError, refetch, isFetching } = useWorkflows();
  const rows: ViewWorkflow[] = (data ?? []).map(toViewModel);

  return (
    <Card className="shadow-card">
      <div className="border-b p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Workflows</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor and manage your ongoing workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Refreshing…" : "Refresh"}
            </Button>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </div>
      </div>

      {/* Loading / Error / Empty states */}
      {isLoading ? (
        <div className="p-6 text-sm text-muted-foreground">Loading workflows…</div>
      ) : isError ? (
        <div className="p-6 text-sm text-destructive">Failed to load workflows.</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">No workflows yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
                {/* New: Category & Tags (if present) */}
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>


              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((wf) => (
                <tr key={wf.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{wf.name}</p>
                      <p className="text-sm text-muted-foreground">{wf.id}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant="outline" className={statusConfig[wf.status].className}>
                      {statusConfig[wf.status].label}
                    </Badge>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary/70 to-primary"
                          style={{ width: `${wf.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{wf.progress}%</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs text-white font-medium">
                        {initials(wf.assignee || "U N")}
                      </div>
                      <span className="text-sm">{wf.assignee || "Unassigned"}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDate(wf.dueDate)}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant="outline" className={priorityConfig[wf.priority].className}>
                      {priorityConfig[wf.priority].label}
                    </Badge>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    {wf.category ? (
                      <Badge variant="secondary" className="bg-secondary/20 border-secondary/30">
                        {wf.category}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm">{(wf as ViewWorkflow & { tasks?: number }).tasks ?? "—"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{(wf as ViewWorkflow & { members?: number }).members ?? "—"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {(wf as ViewWorkflow & { lastUpdatedLabel?: string }).lastUpdatedLabel || (wf.dueDate ? formatDate(wf.dueDate) : "—")}
                    </span>
                  </td>

                  {/* Tags */}
                  <td className="px-6 py-4">
                    {wf.tags?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {wf.tags.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <Button variant="ghost" size="icon" aria-label="More actions">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>



                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
