import { normalizeApiError } from "@/shared/utils/apiErrors";

export const getForbiddenActionFromError = (error: unknown) => {
  const normalized = normalizeApiError(error);
  if (normalized.code !== "auth.forbidden" && normalized.status !== 403) {
    return null;
  }

  const details = normalized.details as { required?: string } | undefined;
  return details?.required ?? null;
};

export const getForbiddenMessage = (error: unknown) => {
  const requiredAction = getForbiddenActionFromError(error);
  if (requiredAction) {
    return `You do not have permission: ${requiredAction}`;
  }
  return "You do not have permission to perform this action.";
};
