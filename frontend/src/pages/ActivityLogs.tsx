// frontend/src/pages/ActivityLogs.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { getActivities, ActivityEvent } from "@/api/activities";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity</h1>
          <p className="text-muted-foreground mt-1">Grouped by conversation (Slack) and issue/PR or repo (GitHub).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <Input placeholder="Search title, text, actor…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <div className="flex items-center gap-2">
            {["github","slack","gmail"].map((p) => (
              <Badge
                key={p}
                variant="outline"
                onClick={() => setProviders(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev, p])}
                className={`cursor-pointer capitalize ${providers.includes(p) ? "bg-muted" : ""}`}
              >
                {p}
              </Badge>
            ))}
            <Badge
              variant="outline"
              className={`cursor-pointer ${providers.length===0 ? "bg-muted" : ""}`}
              onClick={() => setProviders([])}
            >
              All
            </Badge>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
      ) : isError ? (
        <Card className="p-6 text-sm text-destructive">Failed to load.</Card>
      ) : groups.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">No matching groups.</Card>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {groups.map((g) => (
            <AccordionItem key={g.key} value={g.key} className="border-border">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">{g.provider}</Badge>
                  <span className="font-medium">{g.label}</span>
                  <span className="text-xs text-muted-foreground">({g.items.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {g.items.map((ev) => (<ActivityCard key={ev.id} ev={ev} />))}
                </div>
                {/* Future: link to a detail route */}
                {/* <Link to={`/activity/${g.provider}/${encodeURIComponent(ev.context_id!)}`} className="text-xs underline mt-3 inline-block">Open full thread</Link> */}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
