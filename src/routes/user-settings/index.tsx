import { createFileRoute } from "@tanstack/react-router";
import { ProfileSettingsSection } from "@/features/userSettings/pages/UserSettingsPage/sections/ProfileSettingsSection";

export const Route = createFileRoute("/user-settings/")({
  component: ProfileSettingsSection,
  staticData: { title: "User settings", requiresAuth: true },
});
