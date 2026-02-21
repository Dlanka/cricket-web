import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useAuthzStore } from "@/features/authz/store/authzStore";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const refreshMe = useAuthStore((state) => state.refreshMe);
  const status = useAuthStore((state) => state.status);
  const tenantId = useAuthStore((state) => state.tenant?.id ?? null);
  const loadAuthz = useAuthzStore((state) => state.load);
  const clearAuthz = useAuthzStore((state) => state.clear);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (status === "authed") {
      void loadAuthz();
      return;
    }
    if (status === "guest") {
      clearAuthz();
    }
  }, [clearAuthz, loadAuthz, status, tenantId]);

  return <>{children}</>;
};
