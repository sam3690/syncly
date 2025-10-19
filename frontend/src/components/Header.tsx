import { Search, Bell, Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import HealthBadge from "@/components/HealthBadge";
import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";
import UserChip from "@/components/auth/UserChip";
import SecurePing from "@/components/SecurePing";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  const showDiag = import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";

  useEffect(() => {
    // Load saved theme preference from localStorage
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    let shouldBeDark = false;
    
    if (savedTheme === "dark") {
      shouldBeDark = true;
    } else if (savedTheme === "light") {
      shouldBeDark = false;
    } else {
      // No saved preference, use system preference
      shouldBeDark = prefersDark;
    }
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    // Save theme preference to localStorage
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-6 backdrop-blur-sm">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search workflows, tasks, team members..."
            className="pl-10 bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <HealthBadge />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <UserChip />
          <LoginButton />
          <LogoutButton />
        </div>
        {showDiag && <SecurePing />}
      </div>
    </header>
  );
}