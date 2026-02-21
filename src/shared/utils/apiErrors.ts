import type { ApiError } from "../types/http.types";

export type NormalizedApiError = {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
  retryAfterMs?: number;
};

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (typeof error !== "object" || error === null) {
    return { message: error instanceof Error ? error.message : "Unknown error" };
  }

  const apiError = error as ApiError & {
    details?: {
      error?: { code?: string; message?: string; details?: unknown };
    } & Record<string, unknown>;
  };

  const envelopeError =
    apiError.details &&
    typeof apiError.details === "object" &&
    "error" in apiError.details
      ? (apiError.details as {
          error?: { code?: string; message?: string; details?: unknown };
        }).error
      : undefined;

  const code = apiError.code ?? envelopeError?.code;
  const message = envelopeError?.message ?? apiError.message ?? "Request failed";
  const details = envelopeError?.details ?? apiError.details;
  const retryAfterMs =
    details &&
    typeof details === "object" &&
    "retryAfterMs" in details &&
    typeof (details as { retryAfterMs?: unknown }).retryAfterMs === "number"
      ? (details as { retryAfterMs: number }).retryAfterMs
      : undefined;

  return {
    status: apiError.status,
    code,
    message,
    details,
    retryAfterMs,
  };
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = normalizeApiError(error);
  if (apiError.message) {
    if (apiError.status === 401 || apiError.status === 403) {
      const requiredAction =
        apiError.details &&
        typeof apiError.details === "object" &&
        "required" in apiError.details &&
        typeof (apiError.details as { required?: unknown }).required === "string"
          ? (apiError.details as { required: string }).required
          : null;
      if (requiredAction) {
        return `You do not have permission: ${requiredAction}`;
      }
      return "You do not have permission to perform this action.";
    }
    if (apiError.status === 404 || apiError.code === "match.not_found") {
      return "The requested item was not found.";
    }
    if (apiError.status === 400) {
      return apiError.message || "Invalid update request.";
    }
    return apiError.message;
  }
  return fallback;
};
