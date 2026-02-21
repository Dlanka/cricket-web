import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../store/authStore";

export const useAuth = () =>
  useAuthStore(
    useShallow((state) => ({
      status: state.status,
      user: state.user,
      tenant: state.tenant,
      role: state.role,
      isOwner: state.isOwner,
      refreshMe: state.refreshMe,
      logout: state.logout,
    })),
  );
