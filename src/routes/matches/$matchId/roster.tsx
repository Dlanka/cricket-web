import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireAuthed } from "../../_auth";

export const Route = createFileRoute("/matches/$matchId/roster")({
  component: () => null,
  staticData: { title: "Match roster", requiresAuth: true },
  beforeLoad: async (ctx) => {
    await requireAuthed();
    const tournamentId = ctx.search.tournamentId;
    if (!tournamentId) {
      throw redirect({ to: "/tournaments" });
    }
    throw redirect({
      to: "/tournaments/$tournamentId/matches/$matchId/roster",
      params: { tournamentId, matchId: ctx.params.matchId },
      search: {
        teamAId: ctx.search.teamAId,
        teamBId: ctx.search.teamBId,
        teamAName: ctx.search.teamAName,
        teamBName: ctx.search.teamBName,
      },
    });
  },
  validateSearch: (search: Record<string, unknown>) => ({
    tournamentId:
      typeof search.tournamentId === "string" ? search.tournamentId : "",
    teamAId: typeof search.teamAId === "string" ? search.teamAId : "",
    teamBId: typeof search.teamBId === "string" ? search.teamBId : "",
    teamAName: typeof search.teamAName === "string" ? search.teamAName : "",
    teamBName: typeof search.teamBName === "string" ? search.teamBName : "",
  }),
});
