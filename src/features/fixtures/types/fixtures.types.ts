export type TeamBrief = {
  id: string;
  name: string;
  shortName?: string | null;
};

export type MatchResult = {
  type?: "WIN" | "TIE" | "NO_RESULT" | null;
  winnerTeamId?: string | null;
  winByRuns?: number | null;
  winByWkts?: number | null;
  isNoResult?: boolean | null;
};

export type MatchItem = {
  id: string;
  tournamentId: string;
  teamAId?: string | null;
  teamBId?: string | null;
  stage: "LEAGUE" | "R1" | "QF" | "SF" | "FINAL";
  roundNumber?: number | null;
  teamA: TeamBrief;
  teamB: TeamBrief | null;
  scheduledAt?: string | null;
  createdAt?: string | null;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
  phase?: "REGULAR" | "SUPER_OVER";
  hasSuperOver?: boolean;
  superOverStatus?: "PENDING" | "LIVE" | "COMPLETED" | null;
  result?: MatchResult | null;
};

export type ListMatchesResponse = {
  items: MatchItem[];
};

export type GenerateFixturesResponse = {
  createdCount: number;
};

export type BracketStage = "R1" | "QF" | "SF" | "FINAL";

export type BracketFixture = {
  slot: number;
  isPlaceholder: boolean;
  matchId: string | null;
  status: "TBD" | "SCHEDULED" | "LIVE" | "COMPLETED";
  teamA: TeamBrief | null;
  teamB: TeamBrief | null;
  winnerTeamId: string | null;
  resultType?: "WIN" | "TIE" | "NO_RESULT" | null;
  isBye: boolean;
};

export type BracketRound = {
  stage: BracketStage;
  roundNumber: number;
  fixtures: BracketFixture[];
};

export type TournamentBracketResponse = {
  tournamentId: string;
  tournamentType: "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";
  rounds: BracketRound[];
};

export type FixturesViewResponse = {
  version: number;
  tournamentId: string;
  tournamentType: "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";
  stageStatus: {
    league: "PENDING" | "ACTIVE" | "COMPLETED" | string;
    knockout: "PENDING" | "ACTIVE" | "COMPLETED" | string;
  };
  matches: MatchItem[];
  bracket: {
    rounds: BracketRound[];
  };
};

export type TournamentConfigInput = {
  type: "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";
  oversPerInnings: number;
  ballsPerOver: number;
  rules?: {
    qualificationCount: number;
  };
};
