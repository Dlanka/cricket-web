import { createFileRoute } from "@tanstack/react-router";
import { TeamsByTournamentPage } from "@/features/teams/pages/TeamsByTournament/TeamsByTournamentPage";

export const Route = createFileRoute("/tournaments/$tournamentId/teams/")({
  component: TeamsByTournamentPage,
  staticData: { title: "Teams", requiresAuth: true },
});
