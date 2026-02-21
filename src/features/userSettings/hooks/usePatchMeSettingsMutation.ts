import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchMeSettings } from "@/features/userSettings/services/userSettings.service";
import { userSettingsQueryKeys } from "@/features/userSettings/constants/userSettingsQueryKeys";
import type { MeSettingsPatch } from "@/features/userSettings/types/userSettings.types";

export const usePatchMeSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MeSettingsPatch) => patchMeSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(userSettingsQueryKeys.meSettings, updated);
    },
  });
};
