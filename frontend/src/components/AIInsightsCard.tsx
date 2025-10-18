import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

interface Insight {
  id: string;
  type: "optimization" | "warning" | "suggestion";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

const insights: Insight[] = [
  {
    id: "1",
    type: "optimization",
    title: "Workflow Bottleneck Detected",
    description: "Product Launch workflow has a 2-day delay in approval stage. Consider adding an additional approver.",
    impact: "high",
  },
  {
    id: "2",
    type: "suggestion",
    title: "Automation Opportunity",
    description: "Customer Onboarding has repetitive tasks that could be automated, saving 4 hours per week.",
    impact: "medium",
  },
  {
    id: "3",
    type: "warning",
    title: "Resource Allocation Alert",
    description: "Sarah Johnson is assigned to 5 active workflows. Consider redistributing tasks.",
    impact: "high",
  },
];

const insightConfig = {
  optimization: { icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  suggestion: { icon: Lightbulb, color: "text-primary", bg: "bg-primary/10" },
};

const impactColors = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-success",
};

export function AIInsightsCard() {
  return (
    <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Insights</h3>
          <p className="text-sm text-muted-foreground">Smart recommendations for your workflows</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const config = insightConfig[insight.type];
          const Icon = config.icon;

          return (
            <div key={insight.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <span className={`text-xs font-medium ${impactColors[insight.impact]}`}>
                      {insight.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button className="w-full mt-6" variant="outline">
        View All Insights
      </Button>
    </Card>
  );
}