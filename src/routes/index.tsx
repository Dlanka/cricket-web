import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage/DashboardPage";
import { requireAuthed } from "./_auth";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  staticData: { title: "Dashboard", requiresAuth: true },
  beforeLoad: requireAuthed,
});
