export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  error?: { code: string; message: string; details?: unknown };
};

export type TeamBrief = {
  id: string;
  name: string;
  shortName?: string | null;
};

export type ChaseInfo = {
  targetRuns: number;
  runsRemaining: number;
  ballsRemaining: number;
  requiredRunRate: number | null;
  maxLegalBalls: number;
  // backward-compatible aliases from backend
  target?: number;
  runsNeeded?: number;
  firstInningsRuns?: number;
};

export type SuperOverChaseInfo = {
  targetRuns: number;
  firstInningsRuns: number;
  runsRemaining: number;
  ballsRemaining: number;
  requiredRunRate: number | null;
};

export type MatchResult = {
  type: "WIN" | "TIE" | "NO_RESULT" | null;
  winnerTeamId: string | null;
  winByRuns: number | null;
  winByWickets: number | null;
  targetRuns: number | null;
};

export type MatchScoreResponse = {
  matchId: string;
  inningsId: string;
  inningsNumber: number;
  phase?: "REGULAR" | "SUPER_OVER";
  hasSuperOver?: boolean;
  superOverStatus?: "PENDING" | "LIVE" | "COMPLETED" | null;
  superOver?: {
    teamARuns: number;
    teamBRuns: number;
    winnerTeamId: string | null;
    isTie: boolean;
  } | null;
  isChase?: boolean;
  isMatchCompleted?: boolean;
  inningsCompleted?: boolean;
  battingTeam: TeamBrief;
  bowlingTeam: TeamBrief;
  score: {
    runs: number;
    wickets: number;
    balls: number;
    overs: string;
    extras?: number;
    wides?: number;
    noBalls?: number;
    byes?: number;
    legByes?: number;
    penalties?: number;
  };
  chase?: ChaseInfo | null;
  superOverChase?: SuperOverChaseInfo | null;
  result?: MatchResult | null;
  targetRuns?: number | null;
  firstInningsRuns?: number | null;
  current: { strikerId: string; nonStrikerId: string; bowlerId: string };
  lastEvent: { id: string; seq: number; type: string } | null;
  settings: { ballsPerOver: number; oversPerInnings: number };
  timeConfig?: {
    totalMatchMinutes: number | null;
    splitByInnings: boolean;
  };
  timer?: {
    status: "IDLE" | "RUNNING" | "PAUSED";
    elapsedMs: number;
    targetMs: number | null;
    remainingMs: number | null;
    isOvertime: boolean;
  };
};

export type BatterRow = {
  batterId: string;
  playerId?: string | null;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  outKind?: string | null;
  dismissalText?: string | null;
  sr: number;
};

export type BattersResponse = { items: BatterRow[] };

export type BowlerRow = {
  bowlerId: string;
  name: string;
  balls: number;
  overs: string;
  runsConceded: number;
  wickets: number;
  maidens: number;
  wides: number;
  noBalls: number;
  er: number;
};

export type BowlersResponse = { items: BowlerRow[] };

export type OverBallChip = { seq: number; display: string; isLegal: boolean };

export type OverSummaryRow = {
  overNumber: number;
  bowlerId: string | null;
  balls: OverBallChip[];
  runsThisOver: number;
};

export type OversResponse = { items: OverSummaryRow[]; nextCursor: null };

export type EventRow = {
  id: string;
  seq: number;
  type: string;
  summary: string;
  isLegal: boolean;
  createdAt: string;
};

export type EventsResponse = { items: EventRow[]; nextCursor: number | null };

export type ChangeBowlerRequest = {
  bowlerId: string;
};

export type ChangeBowlerResponse = {
  matchId: string;
  inningsId: string;
  bowlerId: string;
  overNumber: number;
};

export type ChangeCurrentBattersRequest = {
  strikerId: string;
  nonStrikerId: string;
  transferStats?: boolean;
};

export type ChangeCurrentBattersResponse = {
  matchId: string;
  inningsId: string;
  strikerId: string;
  nonStrikerId: string;
};

export type UpdateLiveMatchConfigRequest = {
  oversPerInnings?: number;
  ballsPerOver?: number;
};

export type UpdateLiveMatchConfigResponse = {
  matchId: string;
  oversPerInnings: number;
  ballsPerOver: number;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
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

export type MatchTimerResponse = {
  matchId: string;
  timer: {
    status: "IDLE" | "RUNNING" | "PAUSED";
    elapsedMs: number;
    targetMs: number | null;
    remainingMs: number | null;
    isOvertime: boolean;
    totalMatchMinutes?: number | null;
    splitByInnings?: boolean;
  };
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

export type StartSecondInningsRequest = {
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
};

export type StartSecondInningsResponse = {
  matchId: string;
  inningsId: string;
  inningsNumber: number;
};
