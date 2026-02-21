export const scoringQueryKeys = {
  score: (matchId: string) => ["score", matchId] as const,
  availableNextBatters: (matchId: string) =>
    ["matches", matchId, "available-next-batters"] as const,
  innings: {
    batters: (inningsId: string) => ["innings", inningsId, "batters"] as const,
    bowlers: (inningsId: string) => ["innings", inningsId, "bowlers"] as const,
    overs: (inningsId: string, limit = 10) =>
      ["innings", inningsId, "overs", limit] as const,
    events: (inningsId: string) => ["innings", inningsId, "events"] as const,
  },
};
