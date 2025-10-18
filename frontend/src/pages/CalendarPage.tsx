import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Plus, Clock, Users, MapPin } from "lucide-react";
import { useState } from "react";

const events = [
  {
    id: 1,
    title: "Product Launch Meeting",
    time: "09:00 AM - 10:30 AM",
    type: "meeting",
    attendees: 8,
    location: "Conference Room A"
  },
  {
    id: 2,
    title: "Workflow Review: Customer Onboarding",
    time: "11:00 AM - 12:00 PM",
    type: "review",
    attendees: 5,
    location: "Virtual"
  },
  {
    id: 3,
    title: "Team Sync",
    time: "02:00 PM - 02:30 PM",
    type: "meeting",
    attendees: 12,
    location: "Main Office"
  },
  {
    id: 4,
    title: "Client Presentation",
    time: "03:00 PM - 04:00 PM",
    type: "presentation",
    attendees: 6,
    location: "Virtual"
  },
  {
    id: 5,
    title: "Sprint Planning",
    time: "04:30 PM - 05:30 PM",
    type: "planning",
    attendees: 10,
    location: "Conference Room B"
  }
];

const upcomingDeadlines = [
  {
    id: 1,
    workflow: "Content Review Pipeline",
    task: "Final approval",
    dueDate: "Today, 6:00 PM",
    priority: "high"
  },
  {
    id: 2,
    workflow: "Invoice Processing",
    task: "Payment verification",
    dueDate: "Tomorrow, 2:00 PM",
    priority: "medium"
  },
  {
    id: 3,
    workflow: "Bug Triage Process",
    task: "Critical bug fix",
    dueDate: "Jan 28, 10:00 AM",
    priority: "high"
  },
  {
    id: 4,
    workflow: "HR Recruitment",
    task: "Interview scheduling",
    dueDate: "Jan 29, 3:00 PM",
    priority: "low"
  }
];

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "review":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "presentation":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "planning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Calendar</h1>
              <p className="text-muted-foreground mt-1">Manage your schedule and workflow deadlines</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Event
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view events</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Schedule</CardTitle>
                    <CardDescription>January 25, 2025</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-gradient-primary text-white shrink-0">
                        <div className="text-xs font-medium">
                          {event.time.split(' ')[0]}
                        </div>
                        <div className="text-xs opacity-80">
                          {event.time.split(' ')[1]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant="outline" className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees} attendees</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Workflow tasks requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{deadline.workflow}</h4>
                          <p className="text-sm text-muted-foreground">{deadline.task}</p>
                        </div>
                        <Badge variant="outline" className={getPriorityColor(deadline.priority)}>
                          {deadline.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
                        <Clock className="h-4 w-4" />
                        <span>{deadline.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;