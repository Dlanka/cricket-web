import { createFileRoute } from "@tanstack/react-router";
import { MatchRosterPage } from "@/features/roster/pages/MatchRoster/MatchRosterPage";
import { requireAction, requireAuthed } from "@/routes/_auth";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/matches/$matchId/roster",
)({
  component: MatchRosterPage,
  beforeLoad: async () => {
    await requireAuthed();
    await requireAction("roster.manage");
  },
  staticData: { title: "Match roster", requiresAuth: true },
  validateSearch: (search: Record<string, unknown>) => ({
    teamAId: typeof search.teamAId === "string" ? search.teamAId : "",
    teamBId: typeof search.teamBId === "string" ? search.teamBId : "",
    teamAName: typeof search.teamAName === "string" ? search.teamAName : "",
    teamBName: typeof search.teamBName === "string" ? search.teamBName : "",
  }),
});
