import { createFileRoute } from "@tanstack/react-router";
import { SecuritySettingsSection } from "@/features/userSettings/pages/UserSettingsPage/sections/SecuritySettingsSection";

export const Route = createFileRoute("/user-settings/security")({
  component: SecuritySettingsSection,
  staticData: { title: "User settings", requiresAuth: true },
});
