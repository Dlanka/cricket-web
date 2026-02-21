import { createFileRoute } from "@tanstack/react-router";
import { OrganizationSettingsSection } from "@/features/settings/pages/AppSettingsPage/sections/OrganizationSettingsSection";

export const Route = createFileRoute("/settings/")({
  component: OrganizationSettingsSection,
  staticData: { title: "Settings", requiresAuth: true },
});

