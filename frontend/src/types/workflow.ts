export interface Workflow {
  id: string;                         // keep as string in domain (we’ll coerce numbers)
  name: string;
  owner?: string;
  status: "active" | "paused" | "completed";
  createdAt?: string;
  updatedAt?: string;
  completionRate?: number;            // 0..100
  description?: string;
  progress?: number;                  // alternative to completionRate
  tasks?: number;
  members?: number;
  category?: string;                  // e.g., "Marketing"
  priority?: "high" | "medium" | "low";
  tags?: string[];
  lastUpdatedLabel?: string;          // e.g., "2 hours ago"
  dueDate?: string;
}
