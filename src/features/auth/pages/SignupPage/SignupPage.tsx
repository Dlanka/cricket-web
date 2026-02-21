import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoginPageSkeleton } from "@/features/auth/pages/LoginPage/LoginPage.skeleton";
import { SignupIntro } from "./SignupIntro";
import { SignupForm } from "./SignupForm";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authed") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [navigate, status]);

  if (status === "unknown") {
    return <LoginPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <SignupIntro />
          <SignupForm onSuccess={() => navigate({ to: "/dashboard" })} />
        </div>
      </div>
    </div>
  );
};
