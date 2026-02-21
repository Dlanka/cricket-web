import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "../features/auth/pages/LoginPage/LoginPage";
import { redirectIfAuthed } from "./_auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  staticData: { title: "Sign in", requiresAuth: false },
  beforeLoad: redirectIfAuthed,
});
