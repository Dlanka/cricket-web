import { createFileRoute } from "@tanstack/react-router";
import { TournamentDefaultsSettingsSection } from "@/features/settings/pages/AppSettingsPage/sections/TournamentDefaultsSettingsSection";

export const Route = createFileRoute("/settings/defaults")({
  component: TournamentDefaultsSettingsSection,
  staticData: { title: "Settings", requiresAuth: true },
});

