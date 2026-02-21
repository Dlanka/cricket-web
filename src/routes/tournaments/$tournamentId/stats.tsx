import { createFileRoute } from "@tanstack/react-router";
import { TournamentStatsPage } from "@/features/tournaments/pages/TournamentStatsPage/TournamentStatsPage";

export const Route = createFileRoute("/tournaments/$tournamentId/stats")({
  component: TournamentStatsPage,
  staticData: { title: "Stats", requiresAuth: true },
});

