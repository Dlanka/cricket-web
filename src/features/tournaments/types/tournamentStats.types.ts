export type TeamLite = { id: string; name: string; shortName: string | null } | null;

export type StatsRowBase = {
  rank: number;
  playerId: string | null;
  name: string;
  team: TeamLite;
};

export type ExtendedStatFields = {
  matches?: number;
  innings?: number;
  runs?: number;
  wickets?: number;
  average?: number;
  economy?: number;
  strikeRate?: number;
  overs?: number;
  bestBowling?: string;
  runsConceded?: number;
};

export type TournamentStatsSections = {
  runs: Array<
    StatsRowBase & ExtendedStatFields & { runs: number; innings: number; average?: number }
  >;
  wickets: Array<
    StatsRowBase & ExtendedStatFields & { wickets: number; innings: number; economy?: number }
  >;
  highestScores: Array<
    StatsRowBase & ExtendedStatFields & { highestScore: number; strikeRate?: number }
  >;
  bestBowlingFigures: Array<
    StatsRowBase &
      ExtendedStatFields & {
        wickets: number;
        runsConceded: number;
        overs?: number;
        economy?: number;
        bestBowling?: string;
      }
  >;
  battingAverage: Array<
    StatsRowBase &
      ExtendedStatFields & {
        matches?: number;
        runs: number;
        average: number;
        dismissals?: number;
      }
  >;
  bowlingAverage: Array<
    StatsRowBase &
      ExtendedStatFields & {
        matches?: number;
        wickets: number;
        average: number;
        runsConceded?: number;
      }
  >;
  mostHundreds: Array<
    StatsRowBase & ExtendedStatFields & { matches?: number; runs?: number; hundreds: number }
  >;
  mostFifties: Array<
    StatsRowBase & ExtendedStatFields & { matches?: number; runs?: number; fifties: number }
  >;
  mostEconomicalBowlers: Array<
    StatsRowBase &
      ExtendedStatFields & { economy: number; overs: number; runsConceded: number }
  >;
  fiveWicketHauls: Array<
    StatsRowBase &
      ExtendedStatFields & { matches?: number; wickets?: number; fiveWicketHauls: number }
  >;
  sixes: Array<StatsRowBase & ExtendedStatFields & { matches?: number; runs?: number; sixes: number }>;
  fours: Array<StatsRowBase & ExtendedStatFields & { matches?: number; runs?: number; fours: number }>;
  boundaries: Array<
    StatsRowBase & ExtendedStatFields & { boundaries: number; fours: number; sixes: number }
  >;
};

export type TournamentStatsLimits = {
  runs: number;
  wickets: number;
  highestScores: number;
  bestBowlingFigures: number;
  battingAverage: number;
  bowlingAverage: number;
  mostHundreds: number;
  mostFifties: number;
  mostEconomicalBowlers: number;
  fiveWicketHauls: number;
  sixes: number;
  fours: number;
  boundaries: number;
};

export type TournamentStatsResponse = {
  tournamentId: string;
  limits: TournamentStatsLimits;
  sections: TournamentStatsSections;
};
