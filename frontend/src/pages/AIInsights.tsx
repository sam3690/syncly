import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, ArrowRight, CheckCircle2 } from "lucide-react";

const insights = [
  {
    id: 1,
    title: "Optimize Customer Onboarding Workflow",
    description: "AI detected 3 bottlenecks in your customer onboarding process. Implementing suggested changes could reduce completion time by 28%.",
    impact: "high",
    category: "Optimization",
    metrics: { timeSaved: "28%", tasksAffected: 12 },
    icon: Target
  },
  {
    id: 2,
    title: "Team Workload Imbalance Detected",
    description: "Sarah Johnson is handling 40% more tasks than team average. Consider redistributing 5 workflows to balance team capacity.",
    impact: "medium",
    category: "Team Management",
    metrics: { efficiency: "+15%", teamsAffected: 1 },
    icon: TrendingUp
  },
  {
    id: 3,
    title: "Automation Opportunity Identified",
    description: "Invoice processing workflow has 8 repetitive manual steps. Automation could save 12 hours per week.",
    impact: "high",
    category: "Automation",
    metrics: { timeSaved: "12h/week", workflows: 1 },
    icon: Sparkles
  },
  {
    id: 4,
    title: "Deadline Risk Alert",
    description: "3 workflows are trending behind schedule. Recommended to allocate 2 additional team members to prevent delays.",
    impact: "high",
    category: "Risk Management",
    metrics: { workflows: 3, deadline: "2 days" },
    icon: AlertTriangle
  },
  {
    id: 5,
    title: "Process Improvement Suggestion",
    description: "Bug triage workflow could benefit from AI-powered prioritization. Expected to reduce average triage time by 35%.",
    impact: "medium",
    category: "Process",
    metrics: { timeSaved: "35%", accuracy: "+20%" },
    icon: Lightbulb
  }
];

const recommendations = [
  {
    id: 1,
    title: "Enable Smart Task Assignment",
    description: "Let AI automatically assign tasks based on team member skills and workload"
  },
  {
    id: 2,
    title: "Set Up Predictive Alerts",
    description: "Get notified before workflows go off-track with AI-powered predictions"
  },
  {
    id: 3,
    title: "Activate Performance Insights",
    description: "Weekly AI-generated reports on team performance and optimization opportunities"
  }
];

const AIInsights = () => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-8 w-8 text-purple-500" />
              <h1 className="text-3xl font-bold">AI Insights</h1>
            </div>
            <p className="text-muted-foreground">AI-powered recommendations to optimize your workflows</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <p className="text-xs text-muted-foreground mt-1">3 high priority</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Potential Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18h</div>
                <p className="text-xs text-emerald-500 mt-1">per week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency Gain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">+24%</div>
                <p className="text-xs text-emerald-500 mt-1">projected improvement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Implemented</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">this month</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Insights</h2>
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                        <insight.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <Badge variant="outline" className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <CardDescription className="text-base">{insight.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="outline">{insight.category}</Badge>
                          {Object.entries(insight.metrics).map(([key, value]) => (
                            <span key={key} className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{value}</span> {key}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Apply Suggestion
                      </Button>
                      <Button variant="outline" className="gap-2">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="text-xl font-semibold mb-4">AI Features to Explore</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center mb-3">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <CardDescription>{rec.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIInsights;