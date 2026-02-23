import { axiosClient } from "@/shared/services/axios";
import type { ApiResponse } from "@/shared/types/http.types";
import type {
  CreateTeamRequest,
  Team,
  TeamAccessCurrentShare,
  TeamAccessContext,
  TeamAccessLink,
  TeamAccessWhatsappShare,
  UpdateTeamRequest,
} from "../types/teams.types";
import type { CreatePlayerRequest, Player, UpdatePlayerRequest } from "@/features/players/types/players.types";

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

export const createTeamAccessLink = async (
  teamId: string,
  payload?: { expiresInHours?: number },
): Promise<TeamAccessLink> => {
  const response = await axiosClient.post<{ ok: boolean; data: TeamAccessLink }>(
    `/teams/${teamId}/access-links`,
    payload ?? {},
  );
  return response.data.data;
};

export const listTeamAccessLinks = async (teamId: string): Promise<TeamAccessLink[]> => {
  const response = await axiosClient.get<{ ok: boolean; data: TeamAccessLink[] }>(
    `/teams/${teamId}/access-links`,
  );
  return response.data.data;
};

export const getTeamAccessCurrentShare = async (
  teamId: string,
): Promise<TeamAccessCurrentShare | null> => {
  const response = await axiosClient.get<{
    ok: boolean;
    data: TeamAccessCurrentShare | null;
  }>(`/teams/${teamId}/access-links/current-share`);
  return response.data.data;
};

export const revokeTeamAccessLink = async (
  teamId: string,
  linkId: string,
): Promise<void> => {
  await axiosClient.delete(`/teams/${teamId}/access-links/${linkId}`);
};

export const createTeamAccessWhatsappShare = async (
  teamId: string,
  payload?: { expiresInHours?: number; phoneNumber?: string },
): Promise<TeamAccessWhatsappShare> => {
  const response = await axiosClient.post<{
    ok: boolean;
    data: TeamAccessWhatsappShare;
  }>(`/teams/${teamId}/access-links/whatsapp-share`, payload ?? {});
  return response.data.data;
};

export const getTeamAccessContext = async (token: string): Promise<TeamAccessContext> => {
  const response = await axiosClient.get<{ ok: boolean; data: TeamAccessContext }>(
    `/team-access/${token}/context`,
  );
  return response.data.data;
};

export const createTeamAccessPlayer = async (
  token: string,
  payload: CreatePlayerRequest,
): Promise<Player> => {
  const response = await axiosClient.post<{ ok: boolean; data: Player }>(
    `/team-access/${token}/players`,
    payload,
  );
  return response.data.data;
};

export const updateTeamAccessPlayer = async (
  token: string,
  playerId: string,
  payload: UpdatePlayerRequest,
): Promise<Player> => {
  const response = await axiosClient.patch<{ ok: boolean; data: Player }>(
    `/team-access/${token}/players/${playerId}`,
    payload,
  );
  return response.data.data;
};
