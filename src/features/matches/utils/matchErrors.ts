import type { ApiError } from "@/shared/types/http.types";

const codeMessageMap: Record<string, string> = {
  "match.roster_missing": "Set roster for both teams before starting the match.",
  "match.invalid_state": "This match has already started or is completed.",
  "match.batting_pair_invalid": "Striker and non-striker must be different.",
  "match.bowler_invalid": "Select a bowler from the bowling team's playing XI.",
  "match.team_invalid": "Selected team is not valid for this match.",
};

export const getStartMatchErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  const apiError = error as ApiError & {
    details?: { error?: { code?: string; message?: string } };
  };

  if (apiError?.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (apiError?.status === 403) {
    return "You do not have permission to start this match.";
  }
  if (apiError?.status === 409) {
    return "This match has already started or is completed.";
  }

  const code = apiError?.details?.error?.code;
  if (code && codeMessageMap[code]) {
    return codeMessageMap[code];
  }
  if (apiError?.message) {
    return apiError.message;
  }
  return fallback;
};
