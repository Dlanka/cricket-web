import { api } from "@/shared/services/axios";
import type {
  GenerateKnockoutResponse,
  RecomputeStandingsResponse,
  TournamentStandingsResponse,
} from "@/features/tournaments/types/tournamentTypes";

type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  error?: { code?: string; message?: string; details?: unknown };
};

const unwrap = <T>(payload: ApiEnvelope<T> | T): T =>
  payload && typeof payload === "object" && "data" in payload
    ? (payload as ApiEnvelope<T>).data
    : (payload as T);

export const getTournamentStandings = async (
  tournamentId: string,
): Promise<TournamentStandingsResponse> => {
  const response = await api.get<
    ApiEnvelope<TournamentStandingsResponse> | TournamentStandingsResponse
  >(`/tournaments/${tournamentId}/standings`);
  return unwrap(response.data);
};

export const recomputeTournamentStandings = async (
  tournamentId: string,
): Promise<RecomputeStandingsResponse> => {
  const response = await api.post<
    ApiEnvelope<RecomputeStandingsResponse> | RecomputeStandingsResponse
  >(`/tournaments/${tournamentId}/recompute-standings`, {});
  return unwrap(response.data);
};

export const generateKnockout = async (
  tournamentId: string,
): Promise<GenerateKnockoutResponse> => {
  const response = await api.post<
    ApiEnvelope<GenerateKnockoutResponse> | GenerateKnockoutResponse
  >(`/tournaments/${tournamentId}/generate-knockout`, {});
  return unwrap(response.data);
};

