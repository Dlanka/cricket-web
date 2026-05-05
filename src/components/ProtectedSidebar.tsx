import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Moon, Settings, Sun, Trophy } from "lucide-react";
import { Button } from "./ui/button/Button";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useThemePreference } from "../shared/theme/useThemePreference";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const ProtectedSidebar = () => {
  const { logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useThemePreference();

  return (
    <aside className="app-chrome-rail fixed left-0 top-0 z-30 flex w-full items-center justify-between border-r border-outline bg-surface px-4 py-3 shadow-surface-lg backdrop-blur lg:min-h-screen lg:w-20 lg:flex-col lg:justify-start lg:px-3 lg:py-6">
      <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-primary text-sm font-bold uppercase text-on-primary shadow-surface-lg">
        CM
        <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-success shadow-surface-lg" />
      </div>

      <nav className="flex flex-1 items-center justify-end gap-2 lg:mt-10 lg:flex-col lg:justify-start lg:gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              aria-label={item.label}
              className="group relative grid h-11 w-11 place-items-center rounded-2xl text-on-surface-muted transition hover:text-on-primary-container "
              activeProps={{
                className:
                  "bg-primary-container text-on-primary-container shadow-[0_10px_24px_-18px_rgba(15,23,42,0.6)]",
              }}
            >
              <span className="absolute inset-0 rounded-2xl bg-primary-container opacity-0 transition group-hover:opacity-100" />
              <Icon className="relative h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 lg:mt-auto lg:flex-col">
        <Button
          type="button"
          appearance="standard"
          color="primary"
          size="lg"
          aria-label={
            resolvedTheme === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
          title={
            resolvedTheme === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
          onClick={toggleTheme}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <Button
          type="button"
          appearance="standard"
          color="primary"
          size="lg"
          aria-label="Sign out"
          title="Sign out"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  );
};


