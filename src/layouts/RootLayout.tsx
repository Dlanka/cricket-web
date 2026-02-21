import { Outlet } from "@tanstack/react-router";
import { BackgroundGlow } from "../components/BackgroundGlow";
import { useAuth } from "../features/auth/hooks/useAuth";

export const RootLayout = () => {
  const { status } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden text-primary-10">
      <BackgroundGlow />
      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1">
          {status === "unknown" ? (
            <div className="mx-auto flex min-h-[50vh] w-full max-w-2xl items-center justify-center">
              <div className="rounded-2xl border border-neutral-90 bg-neutral-98 px-6 py-4 text-sm font-medium text-neutral-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
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
