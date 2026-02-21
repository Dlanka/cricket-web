import { createFileRoute } from "@tanstack/react-router";
import { requireAction, requireAuthed } from "@/routes/_auth";
import { MatchStartPage } from "@/features/scoring/pages/MatchStart/MatchStartPage";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/matches/$matchId/start",
)({
  component: MatchStartPage,
  beforeLoad: async () => {
    await requireAuthed();
    await requireAction("match.start");
  },
  staticData: { title: "Start match", requiresAuth: true },
});
