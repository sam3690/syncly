import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, FileText, Calendar, TrendingUp, Users, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reports = [
  {
    id: 1,
    name: "Quarterly Workflow Performance",
    type: "Performance",
    createdBy: "John Doe",
    createdAt: "2 days ago",
    size: "2.4 MB",
    status: "completed"
  },
  {
    id: 2,
    name: "Team Productivity Analysis",
    type: "Analytics",
    createdBy: "Sarah Johnson",
    createdAt: "5 days ago",
    size: "1.8 MB",
    status: "completed"
  },
  {
    id: 3,
    name: "Monthly Task Completion Report",
    type: "Tasks",
    createdBy: "Mike Wilson",
    createdAt: "1 week ago",
    size: "3.1 MB",
    status: "completed"
  },
  {
    id: 4,
    name: "Workflow Efficiency Metrics",
    type: "Efficiency",
    createdBy: "Emily Brown",
    createdAt: "2 weeks ago",
    size: "2.7 MB",
    status: "completed"
  },
  {
    id: 5,
    name: "Department Performance Summary",
    type: "Summary",
    createdBy: "David Lee",
    createdAt: "3 weeks ago",
    size: "1.5 MB",
    status: "completed"
  }
];

const reportTemplates = [
  {
    id: 1,
    name: "Workflow Summary",
    description: "Overview of all workflows with status and metrics",
    icon: TrendingUp,
    color: "text-purple-500"
  },
  {
    id: 2,
    name: "Team Performance",
    description: "Individual and team productivity metrics",
    icon: Users,
    color: "text-blue-500"
  },
  {
    id: 3,
    name: "Time Analysis",
    description: "Time tracking and efficiency analysis",
    icon: Calendar,
    color: "text-emerald-500"
  },
  {
    id: 4,
    name: "Custom Report",
    description: "Build a custom report with selected metrics",
    icon: FileText,
    color: "text-amber-500"
  }
];

const Reports = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "generating":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
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
              <h1 className="text-3xl font-bold">Reports</h1>
              <p className="text-muted-foreground mt-1">Generate and manage workflow reports</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Report
              </Button>
            </div>
          </div>

          {/* Report Templates */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <template.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{template.description}</CardDescription>
                    <Button className="w-full mt-4" size="sm">Generate</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Your generated reports and analytics</CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="tasks">Tasks</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{report.createdBy}</TableCell>
                      <TableCell className="text-muted-foreground">{report.createdAt}</TableCell>
                      <TableCell className="text-muted-foreground">{report.size}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Reports;