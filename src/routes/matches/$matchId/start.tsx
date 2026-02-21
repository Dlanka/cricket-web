import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireAuthed } from "../../_auth";

export const Route = createFileRoute("/matches/$matchId/start")({
  component: () => null,
  staticData: { title: "Start match", requiresAuth: true },
  beforeLoad: async (ctx) => {
    await requireAuthed();
    const tournamentId = ctx.search.tournamentId;
    if (!tournamentId) {
      throw redirect({ to: "/matches/$matchId", params: { matchId: ctx.params.matchId } });
    }
    throw redirect({
      to: "/tournaments/$tournamentId/matches/$matchId/start",
      params: { tournamentId, matchId: ctx.params.matchId },
    });
  },
  validateSearch: (search: Record<string, unknown>) => ({
    tournamentId:
      typeof search.tournamentId === "string" ? search.tournamentId : "",
  }),
});
