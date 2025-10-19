import { api } from "./client";

export type ActivityEvent = {
  id: string;
  workspace_id: string;
  provider: "github" | "gmail" | "slack" | "notion" | "trello" | "jira" | "sheets";
  type: string;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  actor?: string | null;
  occurred_at: string;
  context_type?: string | null;
  context_id?: string | null;
  context_label?: string | null;
};

type ListResp = { items: ActivityEvent[]; count: number };

export async function getActivities(): Promise<ActivityEvent[]> {
  const r = await api.get<ListResp>("/api/v1/activities");
  return r.items || [];
}
