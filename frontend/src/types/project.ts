import type { Workflow } from "./workflow";

export interface Project {
  id: string;
  name: string;
  description?: string;
  workflows: Workflow[];
  teamSize: number;
  createdAt: string;
}
