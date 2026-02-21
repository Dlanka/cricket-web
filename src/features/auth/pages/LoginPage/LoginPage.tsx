import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoginForm } from "./LoginForm";
import { LoginIntro } from "./LoginIntro";
import { LoginPageSkeleton } from "./LoginPage.skeleton";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authed") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [status, navigate]);

  if (status === "unknown") {
    return <LoginPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <LoginIntro />
          <LoginForm
            onLoggedIn={() => navigate({ to: "/dashboard" })}
            onSelectTenant={() => navigate({ to: "/select-tenant" })}
          />
        </div>
      </div>
    </div>
  );
};
