import { createFileRoute } from "@tanstack/react-router";
import { requireAuthed } from "@/routes/_auth";
import { MatchScoringPage } from "@/features/scoring/pages/MatchScoring/MatchScoringPage";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/matches/$matchId/score",
)({
  component: RouteComponent,
  beforeLoad: requireAuthed,
  staticData: { title: "Live score", requiresAuth: true },
});

function RouteComponent() {
  const { tournamentId, matchId } = Route.useParams();
  return <MatchScoringPage matchId={matchId} tournamentId={tournamentId} />;
}
