import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsQueryKeys } from "@/features/settings/constants/settingsQueryKeys";
import { patchAppSettings } from "@/features/settings/services/settings.service";
import type { AppSettingsPatch } from "@/features/settings/types/settings.types";

export const usePatchAppSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<AppSettingsPatch>) => patchAppSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.app });
    },
  });
};

