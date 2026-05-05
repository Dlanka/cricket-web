export type MatchStage = "LEAGUE" | "R1" | "QF" | "SF" | "FINAL";
export type MatchStatus = "SCHEDULED" | "LIVE" | "COMPLETED";

export type MatchTeam = {
  id: string;
  name: string;
  shortName?: string | null;
};

export type MatchSummary = {
  id: string;
  stage?: MatchStage | string;
  homeTeamName?: string;
  awayTeamName?: string;
  scheduledAt?: string;
  matchNumber?: number;
};

export type MatchDetail = {
  matchId: string;
  tournamentId: string;
  teams: {
    teamA: MatchTeam;
    teamB: MatchTeam | null;
  };
  oversPerInnings: number;
  ballsPerOver: number;
  timeConfig?: {
    totalMatchMinutes: number | null;
    splitByInnings: boolean;
  };
  status: MatchStatus;
  stage: MatchStage;
  scheduledAt?: string | null;
  currentInningsId?: string | null;
  phase?: "REGULAR" | "SUPER_OVER";
  hasSuperOver?: boolean;
  superOverStatus?: "PENDING" | "LIVE" | "COMPLETED" | null;
  superOver?: {
    teamARuns: number;
    teamBRuns: number;
    winnerTeamId: string | null;
    isTie: boolean;
  } | null;
  toss?: {
    wonByTeamId: string;
    decision: "BAT" | "BOWL";
  } | null;
  result?: {
    type?: "WIN" | "TIE" | "NO_RESULT" | null;
    winnerTeamId?: string | null;
  } | null;
};

export type StartMatchRequest = {
  battingTeamId: string;
  bowlingTeamId: string;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
};

export type StartMatchResponse = {
  matchId: string;
  inningsId: string;
  status: "LIVE";
};

export type UpdateMatchConfigRequest = {
  oversPerInnings?: number;
  ballsPerOver?: number;
};

export type UpdateMatchConfigResponse = {
  matchId: string;
  oversPerInnings: number;
  ballsPerOver: number;
  status: MatchStatus;
};

export type UpdateMatchTimeConfigRequest = {
  totalMatchMinutes?: number;
  splitByInnings?: boolean;
};

export type UpdateMatchTimeConfigResponse = {
  matchId: string;
  timeConfig: {
    totalMatchMinutes: number | null;
    splitByInnings: boolean;
  };
};

export type SetMatchTossRequest = {
  wonByTeamId: string;
  decision: "BAT" | "BOWL";
};

export type SetMatchTossResponse = {
  matchId: string;
  status: MatchStatus;
  toss: {
    wonByTeamId: string;
    decision: "BAT" | "BOWL";
  };
};

export type ResolveMatchTieResponse = {
  matchId: string;
  tournamentId: string;
  result: {
    type: "WIN";
    winnerTeamId: string;
  };
  progression: {
    created: number;
    stage: "R1" | "QF" | "SF" | "FINAL" | null;
    roundNumber: number;
  };
};

export type StartSuperOverRequest = {
  teamA: {
    battingFirst: boolean;
    strikerId: string;
    nonStrikerId: string;
    bowlerId: string;
  };
  teamB: {
    strikerId: string;
    nonStrikerId: string;
    bowlerId: string;
  };
};

export type StartSuperOverResponse = {
  matchId: string;
  inningsId: string;
  inningsNumber: number;
  phase: "SUPER_OVER";
  superOverStatus: "LIVE";
};

export type MatchesListResponse = {
  ok: boolean;
  data: MatchSummary[];
};

export type GenerateFixturesResponse = {
  ok: boolean;
  data?: { count?: number };
};

export type MatchPlayerAwardRow = {
  rank: number;
  playerId: string | null;
  name: string;
  team: {
    id: string;
    name: string | null;
    shortName: string | null;
  } | null;
  matches: number;
  runs: number;
  wickets: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
  fiveWicketHauls: number;
  catches: number;
  runOuts: number;
  strikeRate: number;
  economy: number;
  points: number;
};

export type MatchPlayerOfMatchResponse = {
  matchId: string;
  winner: MatchPlayerAwardRow | null;
  leaderboard: MatchPlayerAwardRow[];
  scoring: {
    run: number;
    wicket: number;
    four: number;
    six: number;
    fiftyBonus: number;
    hundredBonus: number;
    fiveWicketBonus: number;
    catch: number;
    runOut: number;
  };
};
