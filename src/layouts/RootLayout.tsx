import { Outlet } from "@tanstack/react-router";
import { BackgroundGlow } from "../components/BackgroundGlow";
import { useAuth } from "../features/auth/hooks/useAuth";

export const RootLayout = () => {
  const { status } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden text-on-surface">
      <BackgroundGlow />
      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1">
          {status === "unknown" ? (
            <div className="mx-auto flex min-h-half-screen w-full max-w-2xl items-center justify-center">
              <div className="rounded-2xl border border-outline bg-surface px-6 py-4 text-sm font-medium text-on-surface-variant shadow-surface-lg backdrop-blur">
                Checking session...
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


