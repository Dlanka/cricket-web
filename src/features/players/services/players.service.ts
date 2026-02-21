import { api } from "@/shared/services/axios";
import type { ApiResponse } from "@/shared/types/http.types";
import type {
  CreatePlayerRequest,
  Player,
  UpdatePlayerRequest,
} from "@/features/players/types/players.types";

type LegacyPlayersResponse = {
  ok: boolean;
  data: Player[];
};

const normalizePlayer = (player: Player & Record<string, unknown>): Player => ({
  ...player,
  id:
    player.id ||
    (player as { playerId?: string }).playerId ||
    (player as { _id?: string })._id ||
    "",
});

export const fetchPlayersByTeam = async (
  teamId: string,
): Promise<Player[]> => {
  const response = await api.get<LegacyPlayersResponse | Player[]>(
    `/teams/${teamId}/players`,
  );
  const data = Array.isArray(response.data)
    ? response.data
    : "data" in response.data
      ? response.data.data
      : [];
  return data.map((player) => normalizePlayer(player));
};

export const fetchPlayer = async (id: string): Promise<Player> => {
  const response = await api.get<Player>(`/players/${id}`);
  return normalizePlayer(response.data);
};

export const createPlayer = async (
  teamId: string,
  payload: CreatePlayerRequest,
): Promise<Player> => {
  const response = await api.post<Player | LegacyPlayersResponse>(
    `/teams/${teamId}/players`,
    payload,
  );
  const data =
    "data" in response.data ? response.data.data[0] ?? response.data.data : response.data;
  return normalizePlayer(data as Player);
};

export const deletePlayer = async (id: string): Promise<void> => {
  await api.delete(`/players/${id}`);
};

export const updatePlayer = async (
  id: string,
  payload: UpdatePlayerRequest,
): Promise<Player> => {
  const response = await api.patch<ApiResponse<Player>>(`/players/${id}`, payload);
  return normalizePlayer(response.data.data);
};
