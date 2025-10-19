import type { Workflow } from "@/types/workflow";

export const mockWorkflows: Workflow[] = [
  {
    id: "w1",
    name: "Onboarding Automation",
    owner: "John Doe",
    status: "active",
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2025-10-01T10:00:00Z",
    tasks: 18,
    completionRate: 92,
  },
  {
    id: "w2",
    name: "Product Launch",
    owner: "Jane Smith",
    status: "paused",
    createdAt: "2025-08-10T12:00:00Z",
    updatedAt: "2025-09-20T09:00:00Z",
    tasks: 34,
    completionRate: 75,
  },
];
