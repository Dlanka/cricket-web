import { useQuery } from "@tanstack/react-query";
import { userSettingsQueryKeys } from "@/features/userSettings/constants/userSettingsQueryKeys";
import { getMeSettings } from "@/features/userSettings/services/userSettings.service";

export const useMeSettingsQuery = () =>
  useQuery({
    queryKey: userSettingsQueryKeys.meSettings,
    queryFn: getMeSettings,
  });
