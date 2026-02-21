import type { ApiError } from "@/shared/types/http.types";

export const MIN_ROSTER_PLAYERS = 1;
export const MAX_ROSTER_PLAYERS = 11;

export type RosterSelectionState = {
  playingIds: string[];
  captainId?: string;
  keeperId?: string;
};

export const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

export const getSelectionError = (count: number) => {
  if (count < MIN_ROSTER_PLAYERS) {
    return "Select at least 1 player.";
  }
  if (count > MAX_ROSTER_PLAYERS) {
    return "You can select up to 11 players only.";
  }
  return null;
};

export const applyRosterToggle = (
  state: RosterSelectionState,
  playerId: string,
): RosterSelectionState => {
  const exists = state.playingIds.includes(playerId);

  if (!exists && state.playingIds.length >= MAX_ROSTER_PLAYERS) {
    return state;
  }

  const nextPlayingIds = exists
    ? state.playingIds.filter((id) => id !== playerId)
    : [...state.playingIds, playerId];
  const uniquePlayingIds = uniqueIds(nextPlayingIds);

  return {
    playingIds: uniquePlayingIds,
    captainId: exists && state.captainId === playerId ? undefined : state.captainId,
    keeperId: exists && state.keeperId === playerId ? undefined : state.keeperId,
  };
};

export const mapRosterErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError & {
    details?: { error?: { code?: string; message?: string } };
  };

  if (apiError?.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (apiError?.status === 403) {
    return "You do not have permission to update this roster.";
  }

  const code =
    apiError?.details &&
    typeof apiError.details === "object" &&
    "error" in apiError.details
      ? (apiError.details as { error?: { code?: string } }).error?.code
      : undefined;

  const codeMessageMap: Record<string, string> = {
    "match.team_invalid": "Selected team is not valid for this match.",
    "match.roster_invalid": "Roster selection is invalid.",
    "match.roster_size_invalid":
      "Roster must contain between 1 and 11 players.",
    "match.roster_missing": "Set roster for both teams before starting the match.",
    "match.captain_invalid": "Captain must be in selected playing players.",
    "match.keeper_invalid": "Keeper must be in selected playing players.",
    "match.invalid_state": "This match cannot be updated in the current state.",
    "match.batting_pair_invalid": "Striker and non-striker must be different.",
    "match.bowler_invalid": "Select a bowler from the bowling team's playing XI.",
  };

  return (
    (code ? codeMessageMap[code] : undefined) ||
    (error instanceof Error ? error.message : apiError?.message) ||
    fallback
  );
};
