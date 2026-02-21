import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DashboardSummary } from "./DashboardSummary";
import { DashboardPageSkeleton } from "./DashboardPage.skeleton";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { status, user, tenant, role } = useAuth();

  useEffect(() => {
    if (status === "guest") {
      navigate({ to: "/login", replace: true });
    }
  }, [status, navigate]);

  if (status === "unknown") {
    return <DashboardPageSkeleton />;
  }

  if (status === "guest") {
    return null;
  }

  return <DashboardSummary user={user} tenant={tenant} role={role} />;
};
