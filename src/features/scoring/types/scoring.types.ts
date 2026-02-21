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
  };
  chase?: ChaseInfo | null;
  result?: MatchResult | null;
  targetRuns?: number | null;
  firstInningsRuns?: number | null;
  current: { strikerId: string; nonStrikerId: string; bowlerId: string };
  lastEvent: { id: string; seq: number; type: string } | null;
  settings: { ballsPerOver: number; oversPerInnings: number };
};

export type BatterRow = {
  batterId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  outKind?: string | null;
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
