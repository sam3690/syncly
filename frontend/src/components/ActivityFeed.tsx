import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, UserPlus } from "lucide-react";

interface Activity {
  id: string;
  type: "completed" | "warning" | "pending" | "user";
  title: string;
  description: string;
  time: string;
  user?: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "completed",
    title: "Workflow Completed",
    description: "Customer Onboarding Process finished successfully",
    time: "2 minutes ago",
    user: "Emily Davis",
  },
  {
    id: "2",
    type: "warning",
    title: "Deadline Approaching",
    description: "Q4 Marketing Campaign due in 3 days",
    time: "1 hour ago",
    user: "Sarah Johnson",
  },
  {
    id: "3",
    type: "user",
    title: "New Team Member",
    description: "Alex Turner joined the Product Launch team",
    time: "3 hours ago",
  },
  {
    id: "4",
    type: "pending",
    title: "Task Updated",
    description: "Website Redesign progress updated to 60%",
    time: "5 hours ago",
    user: "Alex Turner",
  },
  {
    id: "5",
    type: "completed",
    title: "Milestone Reached",
    description: "Product Launch reached 50% completion",
    time: "1 day ago",
    user: "Mike Chen",
  },
];

const activityConfig = {
  completed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
  pending: { icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  user: { icon: UserPlus, color: "text-info", bg: "bg-info/10" },
};

export function ActivityFeed() {
  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest updates from your team</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <div key={activity.id} className="flex gap-4">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full ${config.bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                  {activity.user && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}