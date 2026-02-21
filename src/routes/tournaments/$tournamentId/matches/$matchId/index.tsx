import { createFileRoute } from "@tanstack/react-router";
import { MatchCenterPage } from "@/features/matches/pages/MatchCenter/MatchCenterPage";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/matches/$matchId/",
)({
  component: RouteComponent,
  staticData: { title: "Match center", requiresAuth: true },
});

function RouteComponent() {
  const { tournamentId, matchId } = Route.useParams();
  return <MatchCenterPage matchId={matchId} tournamentIdParam={tournamentId} />;
}
