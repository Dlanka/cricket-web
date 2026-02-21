import { api } from "@/shared/services/axios";
import type { ApiError } from "@/shared/types/http.types";
import type {
  GenerateFixturesResponse,
  MatchDetail,
  MatchStatus,
  MatchesListResponse,
  MatchTeam,
  MatchSummary,
  StartMatchRequest,
  StartMatchResponse,
  UpdateMatchConfigRequest,
  UpdateMatchConfigResponse,
} from "@/features/matches/types/matches.types";
import type {
  BattingRowSummary,
  BowlingRowSummary,
  FallOfWicketSummary,
  InningsExtrasSummary,
  MatchSummaryResponse,
  MatchSummaryTeam,
} from "@/features/matches/types/matchSummary.types";

const normalizeMatch = (
  match: MatchSummary & Record<string, unknown>,
): MatchSummary => {
  const homeTeam =
    (match.homeTeam as { name?: string } | undefined)?.name ??
    (match as { homeTeamName?: string }).homeTeamName;
  const awayTeam =
    (match.awayTeam as { name?: string } | undefined)?.name ??
    (match as { awayTeamName?: string }).awayTeamName;

  return {
    ...match,
    id:
      match.id ||
      (match as { matchId?: string }).matchId ||
      (match as { _id?: string })._id ||
      "",
    homeTeamName: homeTeam,
    awayTeamName: awayTeam,
  };
};

export const fetchTournamentFixtures = async (
  tournamentId: string,
): Promise<MatchSummary[]> => {
  const response = await api.get<MatchesListResponse | MatchSummary[]>(
    `/tournaments/${tournamentId}/fixtures`,
  );
  const data = "data" in response.data ? response.data.data : response.data;
  return data.map((match) => normalizeMatch(match));
};

export const generateFixtures = async (
  tournamentId: string,
): Promise<{ count?: number }> => {
  const response = await api.post<GenerateFixturesResponse>(
    `/tournaments/${tournamentId}/fixtures`,
  );
  return response.data.data ?? {};
};

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown };
};

type RawTeam = {
  id?: string;
  _id?: string;
  name?: string;
  shortName?: string | null;
};

type RawMatchDetail = {
  matchId?: string;
  id?: string;
  _id?: string;
  tournamentId?: string;
  teams?: {
    teamA?: RawTeam | null;
    teamB?: RawTeam | null;
  } | null;
  teamA?: RawTeam | null; // backward compatibility
  teamB?: RawTeam | null; // backward compatibility
  status?: MatchStatus;
  stage?: MatchDetail["stage"] | string;
  scheduledAt?: string | null;
  currentInningsId?: string | null;
  oversPerInnings?: number;
  ballsPerOver?: number;
};

const unwrapEnvelope = <T>(payload: ApiEnvelope<T> | T): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "ok" in payload &&
    typeof (payload as { ok?: unknown }).ok === "boolean"
  ) {
    const envelope = payload as ApiEnvelope<T>;
    if (!envelope.ok) {
      const apiError: ApiError = {
        message: envelope.error?.message ?? "Request failed",
        details: { error: envelope.error },
      };
      throw apiError;
    }
    return envelope.data as T;
  }
  return payload as T;
};

type SuccessEnvelope<T> = {
  ok?: boolean;
  success?: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown };
  message?: string;
};

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const toText = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const normalizeSummaryTeam = (team: unknown): MatchSummaryTeam | null => {
  if (!team || typeof team !== "object") return null;
  const entry = team as Record<string, unknown>;
  return {
    id: toText(entry.id ?? entry._id),
    name: toText(entry.name, "TBD"),
    shortName:
      typeof entry.shortName === "string" ? entry.shortName : (entry.shortName ?? null) as string | null,
  };
};

const normalizeExtras = (extras: unknown): InningsExtrasSummary => {
  const raw = (extras ?? {}) as Record<string, unknown>;
  return {
    total: toNullableNumber(raw.total),
    wides: toNullableNumber(raw.wides ?? raw.wd),
    noBalls: toNullableNumber(raw.noBalls ?? raw.nb),
    byes: toNullableNumber(raw.byes ?? raw.b),
    legByes: toNullableNumber(raw.legByes ?? raw.lb),
  };
};

const normalizeBattingRow = (row: unknown): BattingRowSummary => {
  const raw = (row ?? {}) as Record<string, unknown>;
  return {
    playerId: toText(raw.playerId ?? raw.id) || null,
    name: toText(raw.name, "-"),
    runs: toNullableNumber(raw.runs ?? raw.r),
    balls: toNullableNumber(raw.balls ?? raw.b),
    fours: toNullableNumber(raw.fours ?? raw.f4 ?? raw["4s"]),
    sixes: toNullableNumber(raw.sixes ?? raw.f6 ?? raw["6s"]),
    strikeRate: toNullableNumber(raw.strikeRate ?? raw.sr),
    isOut: Boolean(raw.isOut),
    dismissalText: toText(raw.dismissalText) || null,
    dismissalKind: toText(raw.dismissalKind ?? raw.kind) || null,
    bowlerName: toText(raw.bowlerName) || null,
    fielderName: toText(raw.fielderName) || null,
  };
};

const normalizeBowlingRow = (row: unknown): BowlingRowSummary => {
  const raw = (row ?? {}) as Record<string, unknown>;
  return {
    playerId: toText(raw.playerId ?? raw.id) || null,
    name: toText(raw.name, "-"),
    overs: toText(raw.overs ?? raw.o) || null,
    maidens: toNullableNumber(raw.maidens ?? raw.m),
    runs: toNullableNumber(
      raw.runs ?? raw.runsConceded ?? raw.conceded ?? raw.r,
    ),
    wickets: toNullableNumber(raw.wickets ?? raw.w),
    wides: toNullableNumber(raw.wides ?? raw.wd),
    noBalls: toNullableNumber(raw.noBalls ?? raw.nb),
    economy: toNullableNumber(raw.economy ?? raw.er),
  };
};

const normalizeFallOfWicketRow = (row: unknown): FallOfWicketSummary => {
  const raw = (row ?? {}) as Record<string, unknown>;
  return {
    wicket: toNullableNumber(raw.wicket),
    runs: toNullableNumber(raw.runs),
    over: toText(raw.over) || null,
    batterName: toText(raw.batterName ?? raw.name) || null,
    kind: toText(raw.kind) || null,
  };
};

const unwrapSummaryEnvelope = <T>(payload: SuccessEnvelope<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in (payload as object)) {
    const envelope = payload as SuccessEnvelope<T>;
    if (envelope.ok === false || envelope.success === false) {
      const apiError: ApiError = {
        message: envelope.error?.message ?? envelope.message ?? "Unable to load match summary.",
        details: { error: envelope.error },
      };
      throw apiError;
    }
    if (envelope.data != null) {
      return envelope.data;
    }
  }
  return payload as T;
};

const normalizeTeam = (team?: RawTeam | null): MatchTeam => ({
  id: team?.id ?? team?._id ?? "",
  name: team?.name ?? "TBD",
  shortName: team?.shortName ?? null,
});

const normalizeMatchDetail = (match: RawMatchDetail): MatchDetail => ({
  matchId: match.matchId ?? match.id ?? match._id ?? "",
  tournamentId: match.tournamentId ?? "",
  teams: {
    teamA: normalizeTeam(match.teams?.teamA ?? match.teamA),
    teamB: match.teams?.teamB || match.teamB ? normalizeTeam(match.teams?.teamB ?? match.teamB) : null,
  },
  oversPerInnings: match.oversPerInnings ?? 0,
  ballsPerOver: match.ballsPerOver ?? 0,
  status: (match.status as MatchDetail["status"]) ?? "SCHEDULED",
  stage: (match.stage as MatchDetail["stage"]) ?? "LEAGUE",
  scheduledAt: match.scheduledAt ?? null,
  currentInningsId: match.currentInningsId ?? null,
});

export const getMatch = async (matchId: string): Promise<MatchDetail> => {
  const response = await api.get<ApiEnvelope<RawMatchDetail> | RawMatchDetail>(
    `/matches/${matchId}`,
  );
  const payload = unwrapEnvelope(response.data);
  return normalizeMatchDetail(payload);
};

export const startMatch = async (
  matchId: string,
  payload: StartMatchRequest,
): Promise<StartMatchResponse> => {
  const response = await api.post<
    ApiEnvelope<StartMatchResponse> | StartMatchResponse
  >(`/matches/${matchId}/start`, payload);
  return unwrapEnvelope(response.data);
};

export const updateMatchConfig = async (
  matchId: string,
  payload: UpdateMatchConfigRequest,
): Promise<UpdateMatchConfigResponse> => {
  const response = await api.patch<
    ApiEnvelope<UpdateMatchConfigResponse> | UpdateMatchConfigResponse
  >(`/matches/${matchId}/config`, payload);
  return unwrapEnvelope(response.data);
};

export const getMatchSummary = async (
  matchId: string,
): Promise<MatchSummaryResponse> => {
  try {
    const response = await api.get<
      SuccessEnvelope<MatchSummaryResponse> | MatchSummaryResponse
    >(`/matches/${matchId}/summary`);
    const payload = unwrapSummaryEnvelope(response.data) as unknown as Record<string, unknown>;
    const match = (payload.match ?? {}) as Record<string, unknown>;
    const teams = (match.teams ?? {}) as Record<string, unknown>;
    const result = (match.result ?? {}) as Record<string, unknown>;
    const rawInnings = Array.isArray(payload.innings) ? payload.innings : [];

    return {
      match: {
        matchId: toText(match.matchId ?? match.id ?? match._id),
        stage: toText(match.stage) || null,
        status: toText(match.status, "SCHEDULED"),
        oversPerInnings: toNullableNumber(match.oversPerInnings),
        ballsPerOver: toNullableNumber(match.ballsPerOver),
        teamA: normalizeSummaryTeam(match.teamA ?? teams.teamA),
        teamB: normalizeSummaryTeam(match.teamB ?? teams.teamB),
        result: {
          outcome: toText(result.outcome ?? result.type) || null,
          type: toText(result.type) || null,
          winnerTeamId: toText(result.winnerTeamId) || null,
          winnerTeamName: toText(result.winnerTeamName) || null,
          winByRuns: toNullableNumber(result.winByRuns),
          winByWickets: toNullableNumber(result.winByWickets),
          ballsLeft: toNullableNumber(result.ballsLeft),
          ballsRemaining: toNullableNumber(result.ballsRemaining ?? result.remainingBalls),
          targetRuns: toNullableNumber(result.targetRuns),
          message: toText(result.message) || null,
        },
      },
      innings: rawInnings.map((entry) => {
        const innings = (entry ?? {}) as Record<string, unknown>;
        const score = (innings.score ?? {}) as Record<string, unknown>;
        return {
          inningsId: toText(innings.inningsId ?? innings.id) || null,
          inningsNumber: toNullableNumber(innings.inningsNumber) ?? 1,
          battingTeam: normalizeSummaryTeam(innings.battingTeam),
          bowlingTeam: normalizeSummaryTeam(innings.bowlingTeam),
          runs: toNullableNumber(score.runs ?? innings.runs),
          wickets: toNullableNumber(score.wickets ?? innings.wickets),
          overs: toText(score.overs ?? innings.overs) || null,
          balls: toNullableNumber(score.balls ?? innings.balls),
          extras: normalizeExtras(innings.extras),
          batting: Array.isArray(innings.batting)
            ? innings.batting.map(normalizeBattingRow)
            : [],
          bowling: Array.isArray(innings.bowling)
            ? innings.bowling.map(normalizeBowlingRow)
            : [],
          fallOfWickets: Array.isArray(innings.fallOfWickets)
            ? innings.fallOfWickets.map(normalizeFallOfWicketRow)
            : [],
        };
      }),
    };
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 400) {
      throw { ...apiError, message: "Invalid match id." } satisfies ApiError;
    }
    if (apiError.status === 404) {
      throw { ...apiError, message: "Match summary not found." } satisfies ApiError;
    }
    if (apiError.status) {
      throw apiError;
    }
    throw {
      message: "Unable to load match summary.",
      details: apiError.details,
    } satisfies ApiError;
  }
};
