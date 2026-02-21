export const fixturesQueryKeys = {
  byTournamentMatches: (tournamentId: string) => ["matches", tournamentId] as const,
  byTournamentFixtures: (tournamentId: string) =>
    ["fixtures", "tournament", tournamentId] as const,
  byTournamentFixturesView: (tournamentId: string) =>
    ["fixtures", "view", "tournament", tournamentId] as const,
  byTournamentBracket: (tournamentId: string) =>
    ["fixtures", "bracket", "tournament", tournamentId] as const,
  match: (matchId: string) => ["match", matchId] as const,
};
