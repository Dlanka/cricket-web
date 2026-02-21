export const tournamentQueryKeys = {
  list: ["tournaments"] as const,
  detail: (tournamentId: string) => ["tournaments", tournamentId] as const,
  standings: (tournamentId: string) =>
    ["tournament", tournamentId, "standings"] as const,
  tournament: (tournamentId: string) => ["tournament", tournamentId] as const,
  tournamentMatches: (tournamentId: string) =>
    ["tournament", tournamentId, "matches"] as const,
  stats: (tournamentId: string) => ["tournament", tournamentId, "stats"] as const,
};
