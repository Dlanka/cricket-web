import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { IndexPageSkeleton } from "./IndexPage.skeleton";

export const IndexPage = () => {
  const { status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "authed") {
      navigate({ to: "/dashboard", replace: true });
    }
    if (status === "guest") {
      navigate({ to: "/login", replace: true });
    }
  }, [status, navigate]);

  if (status === "unknown") {
    return <IndexPageSkeleton />;
  }

  return null;
};
