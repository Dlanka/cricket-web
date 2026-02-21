import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Settings, Trophy } from "lucide-react";
import { Button } from "./ui/button/Button";
import { useAuth } from "../features/auth/hooks/useAuth";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const ProtectedSidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-30 flex w-full items-center justify-between bg-neutral-98 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur lg:min-h-screen lg:w-20 lg:flex-col lg:justify-start lg:px-3 lg:py-6">
      <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-primary-40 text-sm font-bold uppercase text-neutral-98 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.5)]">
        CM
        <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-success-40 shadow-[0_4px_10px_rgba(16,185,129,0.5)]" />
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
              className="group relative grid h-11 w-11 place-items-center rounded-2xl text-primary-50 transition "
              activeProps={{
                className:
                  "bg-primary-95 text-primary-50 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.6)]",
              }}
            >
              <span className="absolute inset-0 rounded-2xl bg-primary-95 opacity-0 transition group-hover:opacity-100" />
              <Icon className="relative h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      <div className="lg:mt-auto">
        <Button
          type="button"
          appearance="standard"
          color="primary"
          size="sm"
          className="h-11 w-11 p-0"
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
