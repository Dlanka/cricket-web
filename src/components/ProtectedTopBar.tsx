import { useMemo } from "react";
import {
  Link,
  useNavigate,
  useMatches,
  useRouterState,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button/Button";
import { useAuth } from "../features/auth/hooks/useAuth";

export const ProtectedTopBar = () => {
  const { user, tenant } = useAuth();
  const navigate = useNavigate();
  const matches = useMatches();
  const location = useRouterState({ select: (state) => state.location });

  const title = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/tournaments")) {
      return "Tournaments";
    }
    const lastWithTitle = [...matches].reverse().find((match) => {
      const staticData = match.staticData as { title?: string } | undefined;
      return Boolean(staticData?.title);
    });
    return (
      (lastWithTitle?.staticData as { title?: string } | undefined)?.title ??
      "CrickManager"
    );
  }, [matches, location.pathname]);

  const showBack = useMemo(() => {
    if (
      location.pathname.startsWith("/tournaments/") &&
      location.pathname !== "/tournaments"
    ) {
      return true;
    }
    return false;
  }, [location.pathname]);

  return (
    <header className="fixed max-h-toolbar min-h-toolbar left-0 right-0 top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-90/99  px-6 py-4  backdrop-blur lg:left-20">
      <div className="flex items-center gap-3">
        {showBack ? (
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            size="sm"
            onClick={() => navigate({ to: "/tournaments" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : null}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-40">
            Page
          </p>
          <p className="text-sm font-semibold text-primary-10">{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/user-settings" className="text-right transition hover:opacity-80">
          <p className="text-sm font-semibold text-primary-10">
            {user?.fullName ?? user?.name ?? user?.email ?? "Staff"}
          </p>
          <p className="text-xs text-neutral-40">{tenant?.name ?? "-"}</p>
        </Link>
      </div>
    </header>
  );
};
