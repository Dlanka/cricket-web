export interface MatchSummaryResponse {
  match: MatchSummary;
  innings: InningsSummary[];
}

export interface MatchSummaryTeam {
  id: string;
  name: string;
  shortName?: string | null;
}

export interface MatchSummaryResult {
  outcome?: "WIN" | "TIE" | "NO_RESULT" | string | null;
  type?: "WIN" | "TIE" | "NO_RESULT" | string | null;
  winnerTeamId?: string | null;
  winnerTeamName?: string | null;
  winByRuns?: number | null;
  winByWickets?: number | null;
  ballsLeft?: number | null;
  ballsRemaining?: number | null;
  targetRuns?: number | null;
  message?: string | null;
}

export interface MatchSummary {
  matchId: string;
  stage?: string | null;
  status: string;
  oversPerInnings?: number | null;
  ballsPerOver?: number | null;
  teamA?: MatchSummaryTeam | null;
  teamB?: MatchSummaryTeam | null;
  result?: MatchSummaryResult | null;
}

export interface InningsExtrasSummary {
  total: number | null;
  wides: number | null;
  noBalls: number | null;
  byes: number | null;
  legByes: number | null;
}

export interface BattingRowSummary {
  playerId?: string | null;
  name: string;
  runs: number | null;
  balls: number | null;
  fours: number | null;
  sixes: number | null;
  strikeRate: number | null;
  isOut: boolean;
  dismissalText?: string | null;
  dismissalKind?: string | null;
  bowlerName?: string | null;
  fielderName?: string | null;
}

export interface BowlingRowSummary {
  playerId?: string | null;
  name: string;
  overs: string | null;
  maidens: number | null;
  runs: number | null;
  wickets: number | null;
  wides: number | null;
  noBalls: number | null;
  economy: number | null;
}

export interface FallOfWicketSummary {
  wicket: number | null;
  runs: number | null;
  over: string | null;
  batterName: string | null;
  kind?: string | null;
}

export interface InningsSummary {
  inningsId?: string | null;
  inningsNumber: number;
  battingTeam?: MatchSummaryTeam | null;
  bowlingTeam?: MatchSummaryTeam | null;
  runs: number | null;
  wickets: number | null;
  overs: string | null;
  balls: number | null;
  extras: InningsExtrasSummary;
  batting: BattingRowSummary[];
  bowling: BowlingRowSummary[];
  fallOfWickets: FallOfWicketSummary[];
}
