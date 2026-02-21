import axios, { AxiosError } from "axios";
import type { ApiError } from "../types/http.types";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export const axiosClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const responseData = error.response?.data as
      | string
      | { error?: { message?: string } }
      | undefined;
    const message =
      typeof responseData === "string"
        ? responseData
        : responseData?.error?.message || error.message || "Request failed";
    const apiError: ApiError = {
      status: error.response?.status,
      message,
      details: error.response?.data,
    };
    return Promise.reject(apiError);
  },
);

export const api = axiosClient;
