import { api } from "@/shared/services/axios";
import type {
  CapabilitiesApiResponse,
  CapabilitiesResponse,
  EffectivePermissionsApiResponse,
  EffectivePermissionsResponse,
} from "@/features/authz/types/authz.types";

export const getMyPermissions = async (): Promise<EffectivePermissionsResponse> => {
  const response = await api.get<EffectivePermissionsApiResponse>("/me/permissions");
  return response.data.data;
};

export const getCapabilities = async (): Promise<CapabilitiesResponse> => {
  const response = await api.get<CapabilitiesApiResponse>("/authz/capabilities");
  return response.data.data;
};
