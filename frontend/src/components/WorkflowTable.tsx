import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  status: "active" | "completed" | "paused";
  progress: number;
  assignee: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

const workflows: Workflow[] = [
  {
    id: "WF-001",
    name: "Q4 Marketing Campaign",
    status: "active",
    progress: 75,
    assignee: "Sarah Johnson",
    dueDate: "Dec 15, 2025",
    priority: "high",
  },
  {
    id: "WF-002",
    name: "Product Launch Preparation",
    status: "active",
    progress: 45,
    assignee: "Mike Chen",
    dueDate: "Jan 10, 2026",
    priority: "high",
  },
  {
    id: "WF-003",
    name: "Customer Onboarding Process",
    status: "completed",
    progress: 100,
    assignee: "Emily Davis",
    dueDate: "Dec 1, 2025",
    priority: "medium",
  },
  {
    id: "WF-004",
    name: "Website Redesign",
    status: "active",
    progress: 60,
    assignee: "Alex Turner",
    dueDate: "Dec 20, 2025",
    priority: "medium",
  },
  {
    id: "WF-005",
    name: "Annual Report Compilation",
    status: "paused",
    progress: 30,
    assignee: "Lisa Wang",
    dueDate: "Jan 5, 2026",
    priority: "low",
  },
];

const statusConfig = {
  active: { label: "Active", className: "bg-primary/10 text-primary border-primary/20" },
  completed: { label: "Completed", className: "bg-success/10 text-success border-success/20" },
  paused: { label: "Paused", className: "bg-warning/10 text-warning border-warning/20" },
};

const priorityConfig = {
  high: { label: "High", className: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { label: "Medium", className: "bg-warning/10 text-warning border-warning/20" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
};

export function WorkflowTable() {
  return (
    <Card className="shadow-card">
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Active Workflows</h3>
            <p className="text-sm text-muted-foreground mt-1">Monitor and manage your ongoing workflows</p>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </div>

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
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {workflows.map((workflow) => (
              <tr key={workflow.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">{workflow.name}</p>
                    <p className="text-sm text-muted-foreground">{workflow.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={statusConfig[workflow.status].className}>
                    {statusConfig[workflow.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all"
                        style={{ width: `${workflow.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{workflow.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs text-white font-medium">
                      {workflow.assignee.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-sm">{workflow.assignee}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {workflow.dueDate}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={priorityConfig[workflow.priority].className}>
                    {priorityConfig[workflow.priority].label}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}