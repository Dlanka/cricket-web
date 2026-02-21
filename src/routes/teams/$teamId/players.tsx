import { createFileRoute } from "@tanstack/react-router";
import { PlayersByTeamPage } from "@/features/players/pages/PlayersByTeam/PlayersByTeamPage";
import { requireAuthed } from "../../_auth";

export const Route = createFileRoute("/teams/$teamId/players")({
  component: PlayersByTeamPage,
  staticData: { title: "Players", requiresAuth: true },
  beforeLoad: requireAuthed,
});
