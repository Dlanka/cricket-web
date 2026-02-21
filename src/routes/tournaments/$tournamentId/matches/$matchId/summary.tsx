import { createFileRoute } from "@tanstack/react-router";
import { requireAuthed } from "@/routes/_auth";
import { MatchSummaryPage } from "@/features/matches/pages/MatchSummary/MatchSummaryPage";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/matches/$matchId/summary",
)({
  component: RouteComponent,
  beforeLoad: requireAuthed,
  staticData: { title: "Match summary", requiresAuth: true },
});

function RouteComponent() {
  const { tournamentId, matchId } = Route.useParams();
  return <MatchSummaryPage matchId={matchId} tournamentId={tournamentId} />;
}

