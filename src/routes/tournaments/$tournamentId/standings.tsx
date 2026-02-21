import { createFileRoute } from "@tanstack/react-router";
import { TournamentStandingsPage } from "@/features/tournaments/pages/TournamentStandingsPage/TournamentStandingsPage";

export const Route = createFileRoute("/tournaments/$tournamentId/standings")({
  component: TournamentStandingsPage,
  staticData: { title: "Standings", requiresAuth: true },
});

