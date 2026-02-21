import { api } from "@/shared/services/axios";
import type { ApiResponse } from "@/shared/types/http.types";
import type {
  CreateResponse,
  DetailsResponse,
  ListResponse,
  TournamentDeleteResponse,
  TournamentCreateInput,
  TournamentDetails,
  TournamentSummary,
  TournamentUpdateInput,
} from "@/features/tournaments/types/tournamentTypes";

const extractEntityId = (value: unknown): string => {
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const directId = record.id ?? record.tournamentId ?? record._id;
  if (typeof directId === "string" && directId.length > 0) return directId;

  const nested = record.tournament ?? record.item ?? record.result;
  if (nested) return extractEntityId(nested);

  return "";
};

const normalizeTournament = (tournament: TournamentSummary & Record<string, unknown>): TournamentSummary => ({
  ...tournament,
  id:
    tournament.id ||
    (tournament as { tournamentId?: string }).tournamentId ||
    (tournament as { _id?: string })._id ||
    "",
});

export const fetchTournaments = async (): Promise<TournamentSummary[]> => {
  const response = await api.get<ListResponse | TournamentSummary[]>(
    "/tournaments",
  );
  const data = "data" in response.data ? response.data.data : response.data;
  return data.map((tournament) => normalizeTournament(tournament));
};

export const createTournament = async (
  payload: TournamentCreateInput,
): Promise<{ id: string }> => {
  const response = await api.post<CreateResponse | { id: string } | TournamentSummary>(
    "/tournaments",
    payload,
  );

  const body = response.data as Record<string, unknown>;
  const candidate = "data" in body ? body.data : body;
  const id = extractEntityId(candidate);

  return { id };
};

export const fetchTournamentById = async (
  id: string,
): Promise<TournamentDetails> => {
  const response = await api.get<DetailsResponse | TournamentDetails>(
    `/tournaments/${id}`,
  );
  const data = "data" in response.data ? response.data.data : response.data;
  return normalizeTournament(data) as TournamentDetails;
};

export const updateTournament = async (
  id: string,
  payload: TournamentUpdateInput,
): Promise<TournamentDetails> => {
  const response = await api.patch<ApiResponse<TournamentDetails>>(
    `/tournaments/${id}`,
    payload,
  );
  return normalizeTournament(response.data.data) as TournamentDetails;
};

export const deleteTournament = async (
  id: string,
): Promise<TournamentDeleteResponse> => {
  const response = await api.delete<
    ApiResponse<TournamentDeleteResponse> | TournamentDeleteResponse
  >(
    `/tournaments/${id}`,
  );

  const payload = "data" in response.data ? response.data.data : response.data;

  return {
    id: payload.id,
    deleted: payload.deleted,
  };
};
