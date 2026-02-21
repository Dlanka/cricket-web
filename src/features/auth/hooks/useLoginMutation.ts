import { useMutation } from "@tanstack/react-query";
import { login } from "../services/authService";
import type { LoginResponse } from "../types/authTypes";

export const useLoginMutation = () =>
  useMutation<LoginResponse, Error, { email: string; password: string }>({
    mutationFn: login,
  });
