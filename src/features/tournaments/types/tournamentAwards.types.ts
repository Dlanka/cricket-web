export type AwardsTeamLite = {
  id: string;
  name: string;
  shortName: string | null;
} | null;

export type PlayerOfSeriesRow = {
  rank: number;
  playerId: string | null;
  name: string;
  team: AwardsTeamLite;
  matches: number;
  runs: number;
  wickets: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
  fiveWicketHauls: number;
  strikeRate: number;
  economy: number;
  points: number;
};

export type PlayerOfSeriesScoring = {
  run: number;
  wicket: number;
  four: number;
  six: number;
  fiftyBonus: number;
  hundredBonus: number;
  fiveWicketBonus: number;
};

export type TournamentPlayerOfSeriesResponse = {
  tournamentId: string;
  winner: PlayerOfSeriesRow | null;
  leaderboard: PlayerOfSeriesRow[];
  scoring: PlayerOfSeriesScoring;
};
