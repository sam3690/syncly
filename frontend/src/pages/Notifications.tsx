import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles,
  Users,
  TrendingUp,
  Clock,
  Settings as SettingsIcon
} from "lucide-react";

const notifications = {
  all: [
    {
      id: 1,
      type: "success",
      icon: CheckCircle2,
      title: "Workflow Completed",
      description: "Customer Onboarding workflow has been completed successfully",
      time: "5 minutes ago",
      read: false
    },
    {
      id: 2,
      type: "warning",
      icon: AlertTriangle,
      title: "Deadline Approaching",
      description: "Invoice Processing workflow due in 2 hours",
      time: "30 minutes ago",
      read: false
    },
    {
      id: 3,
      type: "info",
      icon: Users,
      title: "New Team Member",
      description: "Alex Smith joined your team",
      time: "1 hour ago",
      read: false
    },
    {
      id: 4,
      type: "ai",
      icon: Sparkles,
      title: "AI Insight Available",
      description: "New optimization suggestion for Bug Triage Process",
      time: "2 hours ago",
      read: true
    },
    {
      id: 5,
      type: "info",
      icon: TrendingUp,
      title: "Performance Update",
      description: "Your team's efficiency increased by 15% this week",
      time: "3 hours ago",
      read: true
    },
    {
      id: 6,
      type: "warning",
      icon: Clock,
      title: "Task Overdue",
      description: "Content Review Pipeline has 2 overdue tasks",
      time: "5 hours ago",
      read: true
    }
  ]
};

const Notifications = () => {
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-emerald-500 bg-emerald-500/10";
      case "warning":
        return "text-amber-500 bg-amber-500/10";
      case "info":
        return "text-blue-500 bg-blue-500/10";
      case "ai":
        return "text-purple-500 bg-purple-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const unreadCount = notifications.all.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">Stay updated with your workflow activities</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button variant="outline" size="icon">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <Bell className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {notifications.all.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-primary' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${getNotificationColor(notification.type)}`}>
                        <notification.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="unread" className="space-y-3">
              {notifications.all.filter(n => !n.read).map((notification) => (
                <Card 
                  key={notification.id} 
                  className="hover:shadow-md transition-shadow border-primary"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${getNotificationColor(notification.type)}`}>
                        <notification.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="ai" className="space-y-3">
              {notifications.all.filter(n => n.type === 'ai').map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-primary' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${getNotificationColor(notification.type)}`}>
                        <notification.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Notifications;