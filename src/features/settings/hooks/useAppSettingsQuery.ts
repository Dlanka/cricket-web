import { useQuery } from "@tanstack/react-query";
import { settingsQueryKeys } from "@/features/settings/constants/settingsQueryKeys";
import { getAppSettings } from "@/features/settings/services/settings.service";

export const useAppSettingsQuery = () =>
  useQuery({
    queryKey: settingsQueryKeys.app,
    queryFn: getAppSettings,
  });

