import { useMutation } from "@tanstack/react-query";
import { patchMyPassword } from "@/features/userSettings/services/userSettings.service";

export const usePatchMyPasswordMutation = () =>
  useMutation({
    mutationFn: patchMyPassword,
  });
