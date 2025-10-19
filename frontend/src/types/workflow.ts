export interface Workflow {
  id: string;
  name: string;
  owner: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
  tasks: number;
  completionRate: number; // 0–100
}
