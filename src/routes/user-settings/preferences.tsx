import { createFileRoute } from "@tanstack/react-router";
import { PreferencesSettingsSection } from "@/features/userSettings/pages/UserSettingsPage/sections/PreferencesSettingsSection";

export const Route = createFileRoute("/user-settings/preferences")({
  component: PreferencesSettingsSection,
  staticData: { title: "User settings", requiresAuth: true },
});
