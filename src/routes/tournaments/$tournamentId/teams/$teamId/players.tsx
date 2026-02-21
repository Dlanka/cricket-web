import { createFileRoute } from "@tanstack/react-router";
import { PlayersByTeamPage } from "@/features/players/pages/PlayersByTeam/PlayersByTeamPage";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/teams/$teamId/players",
)({
  component: PlayersByTeamPage,
});
