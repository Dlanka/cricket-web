import { createFileRoute } from "@tanstack/react-router";
import { PermissionsSettingsSection } from "@/features/settings/pages/AppSettingsPage/sections/PermissionsSettingsSection";

export const Route = createFileRoute("/settings/permissions")({
  component: PermissionsSettingsSection,
  staticData: { title: "Settings", requiresAuth: true },
});

