import { useMutation } from "@tanstack/react-query";
import { selectTenant } from "../services/authService";
import type { SelectTenantResponse } from "../types/authTypes";

export const useSelectTenantMutation = () =>
  useMutation<
    SelectTenantResponse,
    Error,
    { loginSessionToken: string; tenantId: string }
  >({
    mutationFn: selectTenant,
  });
