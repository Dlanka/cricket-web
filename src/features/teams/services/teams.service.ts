import { axiosClient } from "@/shared/services/axios";
import type { ApiResponse } from "@/shared/types/http.types";
import type { CreateTeamRequest, Team, UpdateTeamRequest } from "../types/teams.types";

type LegacyTeamsResponse = {
  ok: boolean;
  data: Team[];
};

const normalizeTeam = (team: Team & Record<string, unknown>): Team => ({
  ...team,
  id:
    team.id ||
    (team as { teamId?: string }).teamId ||
    (team as { _id?: string })._id ||
    "",
});

export const fetchTeamsByTournament = async (
  tournamentId: string,
): Promise<Team[]> => {
  const response = await axiosClient.get<LegacyTeamsResponse | Team[]>(
    `/tournaments/${tournamentId}/teams`,
  );
  const data = Array.isArray(response.data)
    ? response.data
    : "data" in response.data
      ? response.data.data
      : [];
  return data.map((team) => normalizeTeam(team));
};

export const fetchTeam = async (id: string): Promise<Team> => {
  const response = await axiosClient.get<ApiResponse<Team> | Team>(`/teams/${id}`);
  const data = "data" in response.data ? response.data.data : response.data;
  return normalizeTeam(data);
};

export const createTeam = async (
  tournamentId: string,
  payload: CreateTeamRequest,
): Promise<Team> => {
  const response = await axiosClient.post<Team | LegacyTeamsResponse>(
    `/tournaments/${tournamentId}/teams`,
    payload,
  );
  const data =
    "data" in response.data ? response.data.data[0] ?? response.data.data : response.data;
  return normalizeTeam(data as Team);
};

export const updateTeam = async (
  id: string,
  payload: UpdateTeamRequest,
): Promise<Team> => {
  const response = await axiosClient.patch<ApiResponse<Team>>(
    `/teams/${id}`,
    payload,
  );
  return normalizeTeam(response.data.data);
};
