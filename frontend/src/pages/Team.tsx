import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Mail, MoreVertical, TrendingUp, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const teamMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@syncly.com",
    role: "Admin",
    status: "active",
    workflows: 12,
    tasksCompleted: 145,
    initials: "JD",
    color: "bg-gradient-primary"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@syncly.com",
    role: "Manager",
    status: "active",
    workflows: 8,
    tasksCompleted: 98,
    initials: "SJ",
    color: "bg-gradient-to-br from-emerald-500 to-teal-500"
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike@syncly.com",
    role: "Member",
    status: "active",
    workflows: 5,
    tasksCompleted: 76,
    initials: "MW",
    color: "bg-gradient-to-br from-amber-500 to-orange-500"
  },
  {
    id: 4,
    name: "Emily Brown",
    email: "emily@syncly.com",
    role: "Member",
    status: "active",
    workflows: 6,
    tasksCompleted: 89,
    initials: "EB",
    color: "bg-gradient-to-br from-pink-500 to-rose-500"
  },
  {
    id: 5,
    name: "David Lee",
    email: "david@syncly.com",
    role: "Member",
    status: "inactive",
    workflows: 3,
    tasksCompleted: 45,
    initials: "DL",
    color: "bg-gradient-to-br from-cyan-500 to-blue-500"
  }
];

const Team = () => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Manager":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Member":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "active"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      : "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Team</h1>
              <p className="text-muted-foreground mt-1">Manage your team members and their roles</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Invite Member
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <p className="text-xs text-emerald-500 mt-1">+2 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4</div>
                <p className="text-xs text-muted-foreground mt-1">80% online rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">34</div>
                <p className="text-xs text-emerald-500 mt-1">+15% increase</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">453</div>
                <p className="text-xs text-emerald-500 mt-1">+8.2% from last week</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Team Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Workflows</TableHead>
                  <TableHead>Tasks Completed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${member.color} text-white font-semibold`}>
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(member.status)}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{member.workflows}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>{member.tasksCompleted}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Role</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Team;