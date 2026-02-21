import { api } from "@/shared/services/axios";
import type {
  GetRosterResponse,
  RosterPlayerEntry,
  RosterTeamEntry,
  SetRosterRequest,
  SetRosterResponse,
} from "@/features/roster/types/roster.types";
import type { ApiError } from "@/shared/types/http.types";

type RawRosterData = {
  matchId?: string;
  teamId?: string;
  teams?:
    | RosterTeamEntry[]
    | Record<string, RosterPlayerEntry[]>
    | null
    | undefined;
};

const normalizeTeams = (
  teams: RawRosterData["teams"],
): RosterTeamEntry[] => {
  if (!teams) {
    return [];
  }
  if (Array.isArray(teams)) {
    return teams.map((team) => ({
      teamId: team.teamId,
      players: team.players ?? [],
    }));
  }
  return Object.entries(teams).map(([teamId, players]) => ({
    teamId,
    players: players ?? [],
  }));
};

const normalizeRosterResponse = (payload: RawRosterData): GetRosterResponse => ({
  matchId: payload.matchId ?? "",
  teams: normalizeTeams(
    payload.teams ??
      // Some backends return grouped roster directly under data without a `teams` key.
      (Object.keys(payload).some((key) => !["matchId", "teamId"].includes(key))
        ? (payload as unknown as Record<string, RosterPlayerEntry[]>)
        : undefined),
  ),
});

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown };
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

export const getRoster = async (matchId: string): Promise<GetRosterResponse> => {
  const response = await api.get<ApiEnvelope<RawRosterData> | RawRosterData>(
    `/matches/${matchId}/roster`,
  );
  const payload = unwrapEnvelope(response.data);
  return normalizeRosterResponse(payload);
};

export const setRoster = async (
  matchId: string,
  payload: SetRosterRequest,
): Promise<SetRosterResponse> => {
  const response = await api.post<ApiEnvelope<SetRosterResponse> | SetRosterResponse>(
    `/matches/${matchId}/roster`,
    payload,
  );
  return unwrapEnvelope(response.data);
};
