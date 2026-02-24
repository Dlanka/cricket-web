export type TournamentType = "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";
export type TournamentStatus = "DRAFT" | "ACTIVE" | "COMPLETED";
export type TournamentStageStatus = "PENDING" | "ACTIVE" | "COMPLETED";
export type TournamentTiePolicy =
  | "LEAGUE_TIE_SHARED"
  | "KNOCKOUT_SUPER_OVER_THEN_TIE_BREAK";

export type TournamentOverview = {
  type: TournamentType;
  status: TournamentStatus;
  settings: {
    oversPerInnings: number;
    ballsPerOver: number;
  };
  progress: {
    totalMatches: number;
    completedMatches: number;
    liveMatches: number;
    scheduledMatches: number;
  };
  stages: {
    league: {
      status: TournamentStageStatus;
      totalMatches: number;
      completedMatches: number;
    };
    knockout: {
      status: TournamentStageStatus;
      totalMatches: number;
      completedMatches: number;
      qualificationCount: number | null;
    };
  };
  rules: {
    points:
      | {
          win: number;
          tie: number;
          noResult: number;
          loss: number;
        }
      | null;
  };
  tiePolicy: TournamentTiePolicy;
};

export type TournamentCreateInput = {
  name: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  type: TournamentType;
  oversPerInnings: number;
  ballsPerOver?: number;
  rules?: {
    qualificationCount?: number;
  };
};

export type TournamentUpdateInput = {
  name?: string;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  type?: TournamentType;
  oversPerInnings?: number;
  ballsPerOver?: number;
  status?: TournamentStatus;
  rules?: {
    qualificationCount?: number;
  };
};

export type TournamentUpdateResponse = TournamentDetails;

export type TournamentSummary = {
  id: string;
  name: string;
  location?: string;
  status: TournamentStatus;
  stageStatus?: {
    league?: "PENDING" | "ACTIVE" | "COMPLETED" | string;
    knockout?: "PENDING" | "ACTIVE" | "COMPLETED" | string;
  };
  startDate?: string;
  endDate?: string;
  type?: TournamentType;
  oversPerInnings?: number;
  ballsPerOver?: number;
};

export type TournamentDetails = TournamentSummary & {
  description?: string;
  venues?: string[];
  rules?: {
    qualificationCount?: number;
  };
  overviewDescription?: string;
  overview?: TournamentOverview;
};

export type ListResponse = {
  ok: boolean;
  data: TournamentSummary[];
};

export type CreateResponse = {
  ok: boolean;
  data: { id: string };
};

export type DetailsResponse = {
  ok: boolean;
  data: TournamentDetails;
};

export type TournamentDeleteCounts = {
  teams: number;
  players: number;
  matches: number;
  matchPlayers: number;
  innings: number;
  inningsBatters: number;
  inningsBowlers: number;
  scoreEvents: number;
};

export type TournamentDeleteResponse = {
  id: string;
  deleted?: TournamentDeleteCounts;
};

export type TeamBrief = {
  id: string;
  name: string;
  shortName?: string | null;
};

export type StandingItem = {
  rank: number;
  team: TeamBrief;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate: number;
};

export type TournamentStandingsResponse = {
  tournamentId: string;
  stage: "LEAGUE";
  leagueCompleted: boolean;
  totalLeagueMatches: number;
  completedLeagueMatches: number;
  items: StandingItem[];
};

export type RecomputeStandingsResponse = {
  ok: true;
  computedAt: string;
  rowCount: number;
};

export type GenerateKnockoutResponse = {
  created: Array<{
    id: string;
    stage: "SF" | "FINAL";
    teamAId: string;
    teamBId: string | null;
  }>;
};
