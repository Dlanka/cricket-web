import { createFileRoute } from "@tanstack/react-router";
import { MatchRulesSettingsSection } from "@/features/settings/pages/AppSettingsPage/sections/MatchRulesSettingsSection";

export const Route = createFileRoute("/settings/match-rules")({
  component: MatchRulesSettingsSection,
  staticData: { title: "Settings", requiresAuth: true },
});

