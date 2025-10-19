import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, ArrowRight, CheckCircle2, BarChart3, Clock, Users, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const iconMap = {
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles
};

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
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/ai/insights`);
      if (!response.ok) throw new Error("Failed to fetch insights");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const insights = data?.insights || [];
  const stats = data?.stats || { activeInsights: 0, timeSaved: "0h", efficiency: "0%" };

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

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/ai/suggestions`);
      if (!response.ok) throw new Error("Failed to fetch suggestions");
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setIsSuggestionsOpen(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // Fallback suggestions
      setSuggestions([
        {
          id: 1,
          title: "Review Open Pull Requests",
          description: "Check for PRs that need review or have been waiting too long.",
          priority: "high",
          type: "review",
          estimatedTime: "15 min"
        },
        {
          id: 2,
          title: "Update Project Documentation",
          description: "Ensure README and docs are up to date with recent changes.",
          priority: "medium",
          type: "documentation",
          estimatedTime: "20 min"
        }
      ]);
      setIsSuggestionsOpen(true);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
                <div className="text-3xl font-bold">{stats.activeInsights || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">AI-generated recommendations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Potential Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.timeSaved || "0h"}</div>
                <p className="text-xs text-emerald-500 mt-1">estimated weekly savings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency Gain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.efficiency || "0%"}</div>
                <p className="text-xs text-emerald-500 mt-1">projected improvement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">GitHub</div>
                <p className="text-xs text-muted-foreground mt-1">real-time activity analysis</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Insights</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Analyzing GitHub activity...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                <p className="text-destructive">Failed to load insights</p>
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No insights available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => {
                  const IconComponent = iconMap[insight.icon] || Target;
                  return (
                    <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                            <IconComponent className="h-6 w-6 text-white" />
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
                              {Object.entries(insight.metrics || {}).map(([key, value]) => (
                                <span key={key} className="text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">{String(value)}</span> {key}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button 
                            className="gap-2"
                            onClick={fetchSuggestions}
                            disabled={isLoadingSuggestions}
                          >
                            <Eye className="h-4 w-4" />
                            {isLoadingSuggestions ? "Loading..." : "View Suggestions"}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => {
                              setSelectedInsight(insight);
                              setIsDialogOpen(true);
                            }}
                          >
                            View Details
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedInsight && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(iconMap[selectedInsight.icon] || Target, { className: "h-5 w-5" })}
                  {selectedInsight.title}
                </DialogTitle>
                <DialogDescription>
                  Detailed analysis and recommendations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedInsight.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Impact Level</h3>
                  <Badge variant="outline" className={getImpactColor(selectedInsight.impact)}>
                    {selectedInsight.impact} impact
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Category</h3>
                  <Badge variant="outline">{selectedInsight.category}</Badge>
                </div>
                {selectedInsight.metrics && Object.keys(selectedInsight.metrics).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Key Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedInsight.metrics).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          {key === 'commits' && <BarChart3 className="h-4 w-4 text-muted-foreground" />}
                          {key === 'prs' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                          {key === 'timeSaved' && <Clock className="h-4 w-4 text-muted-foreground" />}
                          {key === 'contributors' && <Users className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-sm text-muted-foreground capitalize">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-2">Recommended Actions</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Review the highlighted metrics for potential bottlenecks</li>
                    <li>Consider implementing the suggested optimizations</li>
                    <li>Monitor the impact after applying changes</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Suggestions Dialog */}
      <Dialog open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Action Suggestions
            </DialogTitle>
            <DialogDescription>
              Smart recommendations to improve productivity and address potential issues
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No suggestions available at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority} priority
                          </Badge>
                          {suggestion.estimatedTime && (
                            <Badge variant="outline" className="text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {suggestion.estimatedTime}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-sm">{suggestion.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-2">
                          <CheckCircle2 className="h-3 w-3" />
                          Mark Complete
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <ArrowRight className="h-3 w-3" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIInsights;