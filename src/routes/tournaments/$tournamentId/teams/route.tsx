import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tournaments/$tournamentId/teams")({
  component: Outlet,
  staticData: { title: "Teams", requiresAuth: true },
});
