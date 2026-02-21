import { Outlet } from "@tanstack/react-router";
import { ProtectedSidebar } from "../components/ProtectedSidebar";
import { ProtectedTopBar } from "../components/ProtectedTopBar";

export const ProtectedLayout = () => {
  return (
    <div className="min-h-screen">
      <ProtectedSidebar />
      <ProtectedTopBar />
      <main className="pb-12 pt-28 lg:pl-20">
        <Outlet />
      </main>
    </div>
  );
};
