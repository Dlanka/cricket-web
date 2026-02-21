import { createFileRoute } from "@tanstack/react-router";
import { requireAuthed } from "../../_auth";
import { MatchCenterPage } from "@/features/matches/pages/MatchCenter/MatchCenterPage";

export const Route = createFileRoute("/matches/$matchId/")({
  component: RouteComponent,
  beforeLoad: requireAuthed,
  staticData: { title: "Match center", requiresAuth: true },
});

function RouteComponent() {
  const { matchId } = Route.useParams();
  return <MatchCenterPage matchId={matchId} />;
}
