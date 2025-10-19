import { API_BASE,api } from "./client";
import type { Workflow } from "@/types/workflow";

type ListResp = { items: Workflow[]; count: number };

export async function getWorkflows(): Promise<Workflow[]> {
  const resp = await api.get<ListResp>("/api/v1/workflows");
  return (resp.items || []).map((w) => ({ ...w, id: String(w.id) }));
}

export async function createWorkflow(input: Partial<Workflow>): Promise<Workflow> {
  const res = await fetch(`${API_BASE}/api/v1/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  return res.json();
}

export async function createWorkflowAuth(input: Partial<Workflow>, token: string) {
  const res = await fetch(`${API_BASE}/api/v1/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  return res.json() as Promise<Workflow>;
}

export async function updateWorkflowAuth(id: string, patch: Partial<Workflow>, token: string) {
  const res = await fetch(`${API_BASE}/api/v1/workflows/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json() as Promise<Workflow>;
}

export async function deleteWorkflowAuth(id: string, token: string) {
  const res = await fetch(`${API_BASE}/api/v1/workflows/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
}
