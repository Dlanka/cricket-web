import { createFileRoute } from "@tanstack/react-router";
import { PublicTeamAccessPage } from "@/features/teams/pages/PublicTeamAccessPage/PublicTeamAccessPage";

export const Route = createFileRoute("/team-access/$token")({
  component: PublicTeamAccessPage,
  staticData: {
    title: "Team access",
    requiresAuth: false,
    hideAppChrome: true,
  },
});
