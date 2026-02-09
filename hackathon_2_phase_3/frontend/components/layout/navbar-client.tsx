"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Rocket, Search, Menu, Sun, Moon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/auth/user-menu";
import { useTheme } from "next-themes";
import type { User } from "@/types/user";

export function NavbarClient() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        console.log("=== NAVBAR: Fetching session ===");
        const sessionResult = await authClient.getSession();
        console.log("=== NAVBAR: Session result ===", JSON.stringify(sessionResult, null, 2).substring(0, 500));

        if (mounted && sessionResult.data?.user) {
          console.log("=== NAVBAR: Setting user:", sessionResult.data.user.name || sessionResult.data.user.email);
          setUser(sessionResult.data.user);
        } else {
          console.log("=== NAVBAR: No user found in session");
          if (mounted) {
            setUser(null);
            // Don't redirect from navbar - let pages handle auth
          }
        }
      } catch (error) {
        console.error("=== NAVBAR: Error loading session ===", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 glass-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary neon-text" />
            <span className="font-bold text-lg gradient-text">Hackathon Todo</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return (
      <nav className="sticky top-0 z-50 glass-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary neon-text" />
            <span className="font-bold text-lg gradient-text">Hackathon Todo</span>
          </div>
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Logo and hamburger */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <Rocket className="h-6 w-6 text-primary neon-text" />
            <span className="font-bold text-lg hidden sm:inline-block gradient-text">
              Hackathon Todo
            </span>
          </div>
        </div>

        {/* Center - Search (desktop only) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User menu */}
          <UserMenu user={user} />
        </div>
      </div>
    </nav>
  );
}
