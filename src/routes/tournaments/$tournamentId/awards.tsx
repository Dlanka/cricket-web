import { createFileRoute } from "@tanstack/react-router";
import { TournamentAwardsPage } from "@/features/tournaments/pages/TournamentAwardsPage/TournamentAwardsPage";

export const Route = createFileRoute("/tournaments/$tournamentId/awards")({
  component: TournamentAwardsPage,
  staticData: { title: "Awards", requiresAuth: true },
});
