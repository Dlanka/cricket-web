import { api } from "@/shared/services/axios";
import type {
  BracketFixture,
  BracketRound,
  BracketStage,
  FixturesViewResponse,
  GenerateFixturesResponse,
  ListMatchesResponse,
  MatchItem,
  TeamBrief,
  TournamentConfigInput,
  TournamentBracketResponse,
} from "@/features/fixtures/types/fixtures.types";

type LegacyMatchesResponse = {
  ok: boolean;
  data: MatchItem[];
};

type ApiWrapped<T> = {
  ok: boolean;
  data: T;
};

type RawTeam = {
  id?: string;
  _id?: string;
  name?: string;
  shortName?: string | null;
};

type RawMatch = Partial<MatchItem> & {
  id?: string;
  _id?: string;
  teamAId?: string;
  teamBId?: string | null;
  teamA?: RawTeam | null;
  teamB?: RawTeam | null;
  homeTeam?: RawTeam | null;
  awayTeam?: RawTeam | null;
  homeTeamName?: string;
  awayTeamName?: string;
  phase?: "REGULAR" | "SUPER_OVER";
  hasSuperOver?: boolean;
  superOverStatus?: "PENDING" | "LIVE" | "COMPLETED" | null;
  result?: {
    type?: "WIN" | "TIE" | "NO_RESULT" | null;
    winnerTeamId?: string | null;
    winByRuns?: number | null;
    winByWkts?: number | null;
    isNoResult?: boolean | null;
  } | null;
};

const normalizeTeam = (team?: RawTeam | null, fallbackName?: string) =>
  team
    ? {
        id: team.id ?? team._id ?? "",
        name: team.name ?? fallbackName ?? "TBD",
        shortName: team.shortName ?? null,
      }
    : fallbackName
      ? { id: "", name: fallbackName, shortName: null }
      : null;

const normalizeMatch = (match: RawMatch): MatchItem => {
  const teamAId =
    match.teamAId ?? match.teamA?.id ?? match.teamA?._id ?? match.homeTeam?.id ?? match.homeTeam?._id ?? "";
  const teamBId =
    match.teamBId ??
    match.teamB?.id ??
    match.teamB?._id ??
    match.awayTeam?.id ??
    match.awayTeam?._id ??
    null;
  const teamA = normalizeTeam(match.teamA ?? match.homeTeam, match.homeTeamName) ?? {
    id: teamAId,
    name: "TBD",
    shortName: null,
  };
  const teamB = normalizeTeam(match.teamB ?? match.awayTeam, match.awayTeamName);

  const resultType =
    match.result?.type ??
    (match.result?.isNoResult ? "NO_RESULT" : null);

  return {
    id: match.id ?? match._id ?? "",
    tournamentId: match.tournamentId ?? "",
    teamAId,
    teamBId,
    stage: (match.stage as MatchItem["stage"]) ?? "LEAGUE",
    roundNumber: match.roundNumber ?? null,
    teamA,
    teamB,
    scheduledAt: match.scheduledAt ?? null,
    createdAt: match.createdAt ?? null,
    status: (match.status as MatchItem["status"]) ?? "SCHEDULED",
    phase: match.phase ?? "REGULAR",
    hasSuperOver: Boolean(match.hasSuperOver),
    superOverStatus: match.superOverStatus ?? null,
    result: match.result
      ? {
          ...match.result,
          type: resultType,
          isNoResult: match.result.isNoResult ?? resultType === "NO_RESULT",
        }
      : null,
  };
};

export const listByTournament = async (
  tournamentId: string,
): Promise<MatchItem[]> => {
  const response = await api.get<
    ListMatchesResponse | LegacyMatchesResponse | ApiWrapped<RawMatch[]> | RawMatch[]
  >(
    `/tournaments/${tournamentId}/matches`,
  );
  const payload = response.data;
  if (Array.isArray(payload)) {
    return payload.map((match) => normalizeMatch(match));
  }
  if ("items" in payload) {
    return payload.items.map((match) => normalizeMatch(match as RawMatch));
  }
  return (payload.data ?? []).map((match) => normalizeMatch(match as RawMatch));
};

export const generate = async (
  tournamentId: string,
  payload?: { regenerate?: boolean },
): Promise<GenerateFixturesResponse> => {
  const response = await api.post<ApiWrapped<GenerateFixturesResponse>>(
    `/tournaments/${tournamentId}/generate-fixtures`,
    payload ?? {},
  );
  return response.data.data;
};

export const updateTournamentConfig = async (
  tournamentId: string,
  payload: TournamentConfigInput,
) => {
  const response = await api.patch<ApiWrapped<Record<string, unknown>>>(
    `/tournaments/${tournamentId}`,
    payload,
  );
  return response.data.data;
};

export const getMatch = async (matchId: string): Promise<MatchItem> => {
  const response = await api.get<ApiWrapped<RawMatch>>(`/matches/${matchId}`);
  return normalizeMatch(response.data.data);
};

type RawBracketFixture = {
  slot?: number;
  isPlaceholder?: boolean;
  matchId?: string | null;
  status?: "TBD" | "SCHEDULED" | "LIVE" | "COMPLETED";
  teamA?: RawTeam | null;
  teamB?: RawTeam | null;
  winnerTeamId?: string | null;
  resultType?: "WIN" | "TIE" | "NO_RESULT" | null;
  result?: {
    type?: "WIN" | "TIE" | "NO_RESULT" | null;
    isNoResult?: boolean | null;
  } | null;
  isBye?: boolean;
};

type RawBracketRound = {
  stage?: BracketStage;
  roundNumber?: number;
  fixtures?: RawBracketFixture[];
};

type RawBracketResponse = {
  tournamentId?: string;
  tournamentType?: "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";
  rounds?: RawBracketRound[];
};

type RawFixturesViewResponse = {
  version?: number;
  tournamentId?: string;
  tournamentType?: "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";
  stageStatus?: {
    league?: "PENDING" | "ACTIVE" | "COMPLETED" | string;
    knockout?: "PENDING" | "ACTIVE" | "COMPLETED" | string;
  };
  matches?: RawMatch[];
  bracket?: {
    rounds?: RawBracketRound[];
  };
};

const toTeamBrief = (team?: RawTeam | null): TeamBrief | null => {
  if (!team) return null;
  return {
    id: team.id ?? team._id ?? "",
    name: team.name ?? "TBD",
    shortName: team.shortName ?? null,
  };
};

const normalizeBracketFixture = (fixture: RawBracketFixture): BracketFixture => {
  const resultType =
    fixture.resultType ??
    fixture.result?.type ??
    (fixture.result?.isNoResult ? "NO_RESULT" : null);
  return {
    slot: fixture.slot ?? 0,
    isPlaceholder: Boolean(fixture.isPlaceholder),
    matchId: fixture.matchId ?? null,
    status: fixture.status ?? "TBD",
    teamA: toTeamBrief(fixture.teamA),
    teamB: toTeamBrief(fixture.teamB),
    winnerTeamId: fixture.winnerTeamId ?? null,
    resultType,
    isBye: Boolean(fixture.isBye),
  };
};

const normalizeBracketRound = (round: RawBracketRound): BracketRound => ({
  stage: round.stage ?? "R1",
  roundNumber: round.roundNumber ?? 1,
  fixtures: (round.fixtures ?? []).map(normalizeBracketFixture),
});

export const getTournamentFixturesView = async (
  tournamentId: string,
): Promise<FixturesViewResponse> => {
  const response = await api.get<ApiWrapped<RawFixturesViewResponse> | RawFixturesViewResponse>(
    `/tournaments/${tournamentId}/fixtures-view`,
  );
  const payload = "data" in response.data ? response.data.data : response.data;

  return {
    version: payload.version ?? 1,
    tournamentId: payload.tournamentId ?? tournamentId,
    tournamentType: payload.tournamentType ?? "LEAGUE",
    stageStatus: {
      league: payload.stageStatus?.league ?? "PENDING",
      knockout: payload.stageStatus?.knockout ?? "PENDING",
    },
    matches: (payload.matches ?? []).map(normalizeMatch),
    bracket: {
      rounds: (payload.bracket?.rounds ?? []).map(normalizeBracketRound),
    },
  };
};

export const getTournamentBracketFixtures = async (
  tournamentId: string,
): Promise<TournamentBracketResponse> => {
  const response = await api.get<ApiWrapped<RawBracketResponse> | RawBracketResponse>(
    `/tournaments/${tournamentId}/fixtures-bracket`,
  );

  const payload = "data" in response.data ? response.data.data : response.data;

  return {
    tournamentId: payload.tournamentId ?? tournamentId,
    tournamentType: payload.tournamentType ?? "LEAGUE",
    rounds: (payload.rounds ?? []).map(normalizeBracketRound),
  };
};
