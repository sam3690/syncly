import { Github, Mail, Slack, Clock3, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ActivityEvent } from "@/api/activities";

const PROVIDER = {
  github: { label: "GitHub", icon: Github, badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  slack:  { label: "Slack",  icon: Slack,  badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  gmail:  { label: "Gmail",  icon: Mail,   badge: "bg-red-500/10 text-red-400 border-red-500/20" },
} as const;

export function ActivityCard({ ev }: { ev: ActivityEvent }) {
  const meta = PROVIDER[(ev.provider as keyof typeof PROVIDER)] ?? {
    label: ev.provider,
    icon: MessageSquare,
    badge: "bg-muted text-muted-foreground border-border",
  };
  const Icon = meta.icon as any;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow bg-card/60 border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
            <Icon className="h-5 w-5 opacity-90" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-5 line-clamp-1">{ev.title || "(no title)"}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {ev.actor && <span className="truncate max-w-[160px]">{ev.actor}</span>}
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                {new Date(ev.occurred_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Badge variant="outline" className={cn("shrink-0", meta.badge)}>{meta.label}</Badge>
      </div>

      {ev.description && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{ev.description}</p>
      )}

      {ev.url && (
        <a
          className="mt-3 inline-block text-xs underline opacity-80 hover:opacity-100"
          href={ev.url}
          target="_blank"
          rel="noreferrer"
        >
          Open ↗
        </a>
      )}
    </Card>
  );
}
