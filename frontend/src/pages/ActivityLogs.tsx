// frontend/src/pages/ActivityLogs.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityItem } from "@/components/ActivityItem";

export default function ActivityLogsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery<ActivityEvent[]>({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  const [q, setQ] = useState("");
  const [providers, setProviders] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return data.filter((ev) => {
      const okP = providers.length === 0 || providers.includes(ev.provider);
      if (!okP) return false;
      if (!ql) return true;
      return (`${ev.title ?? ""} ${ev.description ?? ""} ${ev.actor ?? ""}`).toLowerCase().includes(ql);
    });
  }, [data, q, providers]);

  // group by provider + context_id
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; provider: string; label: string; items: ActivityEvent[] }>();
    for (const ev of filtered) {
      const key = `${ev.provider}:${ev.context_id ?? "misc"}`;
      const label =
        ev.context_label ||
        (ev.provider === "slack" ? "Slack conversation" :
         ev.provider === "github" ? "GitHub activity" : "Activity");
      if (!map.has(key)) map.set(key, { key, provider: ev.provider, label, items: [] });
      map.get(key)!.items.push(ev);
    }
    // sort each group by time desc
    const arr = Array.from(map.values());
    for (const g of arr) g.items.sort((a,b) => +new Date(b.occurred_at) - +new Date(a.occurred_at));
    // sort groups by latest item time desc
    arr.sort((a,b) => +new Date(b.items[0]?.occurred_at||0) - +new Date(a.items[0]?.occurred_at||0));
    return arr;
  }, [filtered]);

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Activity Logs</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
                </div>
            </div>

            <Card className="p-4 space-y-3">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                ) : isError ? (
                    <div className="text-sm text-destructive">Failed to load.</div>
                ) : !data?.length ? (
                    <div className="text-sm text-muted-foreground">No activity yet.</div>
                ) : (
                    data.map((ev) => (
                        <ActivityItem
                            key={ev.id}
                            provider={ev.provider}
                            title={ev.title ?? ""}
                            actor={ev.actor ?? ""}
                            occurred_at={ev.occurred_at}
                            description={ev.description ?? ""}
                            url={ev.url ?? ""}
                        />
                    ))
                )}
            </Card>
        </div>
    );
}
