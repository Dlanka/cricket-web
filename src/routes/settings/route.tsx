import { createFileRoute } from "@tanstack/react-router";
import { AppSettingsPage } from "@/features/settings/pages/AppSettingsPage/AppSettingsPage";

export const Route = createFileRoute("/settings")({
  component: AppSettingsPage,
  staticData: { title: "Settings", requiresAuth: true },
});
