export type MatchStage = "LEAGUE" | "R1" | "SF" | "FINAL";
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
  status: MatchStatus;
  stage: MatchStage;
  scheduledAt?: string | null;
  currentInningsId?: string | null;
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

export type MatchesListResponse = {
  ok: boolean;
  data: MatchSummary[];
};

export type GenerateFixturesResponse = {
  ok: boolean;
  data?: { count?: number };
};
