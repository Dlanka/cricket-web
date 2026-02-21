import { useMutation } from "@tanstack/react-query";
import { signup } from "@/features/auth/services/authService";
import type { SignupResponse } from "@/features/auth/types/authTypes";

export const useSignupMutation = () =>
  useMutation<
    SignupResponse,
    Error,
    { email: string; password: string; fullName: string; tenantName: string }
  >({
    mutationFn: signup,
  });
