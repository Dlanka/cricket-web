import { createFileRoute } from "@tanstack/react-router";
import { TournamentDetailsPage } from "@/features/tournaments/pages/TournamentDetailsPage/TournamentDetailsPage";

export const Route = createFileRoute("/tournaments/$tournamentId/")({
  component: TournamentDetailsPage,
  staticData: { title: "Tournament details", requiresAuth: true },
});
