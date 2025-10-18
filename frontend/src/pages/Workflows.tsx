import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreVertical, Clock, Users, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

const workflows = [
  {
    id: 1,
    name: "Customer Onboarding",
    description: "Automated customer onboarding process",
    status: "active",
    progress: 75,
    tasks: 12,
    members: 5,
    lastUpdated: "2 hours ago",
    category: "Sales"
  },
  {
    id: 2,
    name: "Content Review Pipeline",
    description: "Multi-stage content review and approval",
    status: "active",
    progress: 60,
    tasks: 8,
    members: 3,
    lastUpdated: "5 hours ago",
    category: "Marketing"
  },
  {
    id: 3,
    name: "Bug Triage Process",
    description: "Automated bug tracking and assignment",
    status: "paused",
    progress: 45,
    tasks: 15,
    members: 7,
    lastUpdated: "1 day ago",
    category: "Engineering"
  },
  {
    id: 4,
    name: "Invoice Processing",
    description: "Automated invoice review and payment",
    status: "active",
    progress: 90,
    tasks: 6,
    members: 4,
    lastUpdated: "30 mins ago",
    category: "Finance"
  },
  {
    id: 5,
    name: "HR Recruitment",
    description: "Candidate screening and interview scheduling",
    status: "completed",
    progress: 100,
    tasks: 10,
    members: 6,
    lastUpdated: "3 days ago",
    category: "HR"
  },
  {
    id: 6,
    name: "Product Launch",
    description: "End-to-end product launch workflow",
    status: "active",
    progress: 35,
    tasks: 20,
    members: 8,
    lastUpdated: "1 hour ago",
    category: "Product"
  }
];

const Workflows = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "paused":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Workflows</h1>
              <p className="text-muted-foreground mt-1">Manage and monitor your automated workflows</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Workflows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{workflow.category}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{workflow.progress}%</span>
                    </div>
                    <Progress value={workflow.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-2 text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>{workflow.tasks}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{workflow.members}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{workflow.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Workflows;