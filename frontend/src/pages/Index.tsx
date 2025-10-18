import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { WorkflowTable } from "@/components/WorkflowTable";
import { PerformanceChart } from "@/components/PerformanceChart";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { Button } from "@/components/ui/button";
import { Workflow, Users, CheckCircle2, Zap, Plus } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back! Here's what's happening with your workflows today.
              </p>
            </div>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Workflows"
              value={24}
              subtitle="3 new this week"
              icon={Workflow}
              trend={{ value: "12%", isPositive: true }}
              iconColor="primary"
            />
            <StatCard
              title="Completed Tasks"
              value={156}
              subtitle="This month"
              icon={CheckCircle2}
              trend={{ value: "8%", isPositive: true }}
              iconColor="success"
            />
            <StatCard
              title="Team Members"
              value={12}
              subtitle="Across 5 departments"
              icon={Users}
              iconColor="info"
            />
            <StatCard
              title="AI Insights"
              value={7}
              subtitle="New recommendations"
              icon={Zap}
              trend={{ value: "3", isPositive: true }}
              iconColor="warning"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PerformanceChart />
              <WorkflowTable />
            </div>
            
            <div className="space-y-6">
              <AIInsightsCard />
              <ActivityFeed />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;