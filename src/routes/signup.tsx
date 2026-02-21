import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "@/features/auth/pages/SignupPage/SignupPage";
import { redirectIfAuthed } from "@/routes/_auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  staticData: { title: "Sign up", requiresAuth: false },
  beforeLoad: redirectIfAuthed,
});
