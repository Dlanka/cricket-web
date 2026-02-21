import { createFileRoute } from "@tanstack/react-router";
import { TenantMembersSettingsSection } from "@/features/settings/pages/AppSettingsPage/sections/TenantMembersSettingsSection";

export const Route = createFileRoute("/settings/tenant-members")({
  component: TenantMembersSettingsSection,
  staticData: { title: "Settings", requiresAuth: true },
});
