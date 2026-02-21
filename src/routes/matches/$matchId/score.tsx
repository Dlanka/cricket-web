import { createFileRoute } from "@tanstack/react-router";
import { requireAuthed } from "../../_auth";
import { MatchScoringPage } from "@/features/scoring/pages/MatchScoring/MatchScoringPage";

export const Route = createFileRoute("/matches/$matchId/score")({
  component: RouteComponent,
  beforeLoad: requireAuthed,
  staticData: { title: "Live score", requiresAuth: true },
});

function RouteComponent() {
  const { matchId } = Route.useParams();
  return <MatchScoringPage matchId={matchId} />;
}
