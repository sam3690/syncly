import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Workflows from "./pages/Workflows";
import Team from "./pages/Team";
import Analytics from "./pages/Analytics";
import CalendarPage from "./pages/CalendarPage";
import Reports from "./pages/Reports";
import AIInsights from "./pages/AIInsights";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import protect from "@/components/auth/Protected";
import ReportsPage from "@/pages/Reports"; 
import React from "react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/team" element={<Team />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={React.createElement(protect(ReportsPage))} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
