// frontend/src/pages/ActivityLogs.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivities, ActivityEvent } from "@/api/activities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityItem } from "@/components/ActivityItem";

export default function ActivityLogsPage() {
    const { data, isLoading, isError, refetch } = useQuery<ActivityEvent[]>({
        queryKey: ["activities"],
        queryFn: getActivities,
    });

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
