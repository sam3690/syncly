import { api } from "./client";
import { mockWorkflows } from "./mock-data";
import type { Workflow } from "@/types/workflow";

export async function getWorkflows(): Promise<Workflow[]> {
  try {
    // Later this will call: await api.get<Workflow[]>("/api/v1/workflows")
    // For now, return mock data with small delay
    await new Promise((r) => setTimeout(r, 300));
    return mockWorkflows;
  } catch (err) {
    console.error("Failed to fetch workflows:", err);
    return [];
  }
}
