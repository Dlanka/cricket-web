import { api } from "@/shared/services/axios";
import type {
  LoginApiResponse,
  LoginResponse,
  MeApiResponse,
  MeResponse,
  SelectTenantApiResponse,
  SelectTenantResponse,
  SignupApiResponse,
  SignupResponse,
} from "@/features/auth/types/authTypes";

export const login = async (payload: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  const response = await api.post<LoginApiResponse>("/auth/login", payload);
  return response.data.data;
};

export const selectTenant = async (payload: {
  loginSessionToken: string;
  tenantId: string;
}): Promise<SelectTenantResponse> => {
  const response = await api.post<
    SelectTenantApiResponse | SelectTenantResponse
  >("/auth/select-tenant", payload);
  if ("data" in response.data) return response.data.data;
  return response.data;
};

export const signup = async (payload: {
  email: string;
  password: string;
  fullName: string;
  tenantName: string;
}): Promise<SignupResponse> => {
  const response = await api.post<SignupApiResponse>("/auth/signup", payload);
  return response.data.data;
};

export const getMe = async (): Promise<MeResponse> => {
  const response = await api.get<MeApiResponse>("/me");
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
