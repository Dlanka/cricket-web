import {
  Navigate,
  Outlet,
  useMatches,
  useRouterState,
} from "@tanstack/react-router";
import { BackgroundGlow } from "../../components/BackgroundGlow";
import { ProtectedSidebar } from "../../components/ProtectedSidebar";
import { ProtectedTopBar } from "../../components/ProtectedTopBar";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { BackgroundDecor } from "../../shared/components/layout/BackgroundDecor";

export const AppLayout = () => {
  const { status } = useAuth();
  const matches = useMatches();
  const location = useRouterState({ select: (state) => state.location });
  const hideChrome =
    matches.some(
      (match) =>
        (match.staticData as { hideAppChrome?: boolean })?.hideAppChrome,
    ) || location.pathname.startsWith("/tournaments/");
  const requiresAuth = matches.some(
    (match) => (match.staticData as { requiresAuth?: boolean })?.requiresAuth,
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden text-primary-10">
      <BackgroundGlow />
      <BackgroundDecor
        imageType="ThrowBall"
        className="-right-[12%] top-20 w-100 -rotate-30 opacity-15"
      />
      <BackgroundDecor
        imageType="Ball"
        className="-bottom-30 -left-[10%] w-150 opacity-20"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1 relative">
          {status === "unknown" ? (
            <div className="mx-auto flex min-h-[50vh] w-full max-w-2xl items-center justify-center">
              <div className="rounded-2xl border border-neutral-90 bg-neutral-98 px-6 py-4 text-sm font-medium text-neutral-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
                Checking session...
              </div>
            </div>
          ) : status === "guest" && requiresAuth ? (
            <Navigate to="/login" replace />
          ) : status === "authed" && !hideChrome ? (
            <div className="min-h-screen pt-toolbar pb-12 lg:pl-20">
              <ProtectedSidebar />
              <ProtectedTopBar />
              <div className="w-full">
                <Outlet />
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};
