export interface Integration {
  id: string;
  name: string;           // e.g. Gmail, Slack
  status: "connected" | "disconnected";
  connectedAt?: string;
  userId?: string;
}
