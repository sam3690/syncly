import { Github, Mail, Slack, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  provider: string;
  title: string;
  actor?: string | null;
  occurred_at: string;
  description?: string | null;
  url?: string | null;
};

const providerConfig: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  github: {
    label: "GitHub",
    color: "bg-blue-500/10 text-blue-400 border-blue-400/20",
    icon: <Github className="h-4 w-4" />,
  },
  gmail: {
    label: "Gmail",
    color: "bg-red-500/10 text-red-400 border-red-400/20",
    icon: <Mail className="h-4 w-4" />,
  },
  slack: {
    label: "Slack",
    color: "bg-purple-500/10 text-purple-400 border-purple-400/20",
    icon: <Slack className="h-4 w-4" />,
  },
};

export function ActivityItem({ provider, title, actor, occurred_at, description, url }: Props) {
  const conf = providerConfig[provider] || {
    label: provider,
    color: "bg-muted text-muted-foreground border-border",
    icon: <Clock className="h-4 w-4" />,
  };

  return (
    <Card className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-muted flex items-center justify-center">
            {conf.icon}
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground line-clamp-1">
              {title || "(no title)"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {actor ? `${actor} • ` : ""}
              {new Date(occurred_at).toLocaleString()}
            </p>
          </div>
        </div>

        <Badge variant="outline" className={conf.color}>
          {conf.label}
        </Badge>
      </div>

      {description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
          {description.slice(0, 200)}
          {description.length > 200 && "..."}
        </p>
      )}

      {url && (
        <a
          href={url}
          target="_blank"
          className="mt-2 inline-block text-xs text-blue-400 hover:underline"
        >
          View ↗
        </a>
      )}
    </Card>
  );
}
