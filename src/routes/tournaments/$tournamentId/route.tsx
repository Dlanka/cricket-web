import { createFileRoute } from "@tanstack/react-router";
import { TournamentLayout } from "@/app/layouts/TournamentLayout";
import { requireAuthed } from "../../_auth";

export const Route = createFileRoute("/tournaments/$tournamentId")({
  beforeLoad: requireAuthed,
  staticData: { hideAppChrome: true, requiresAuth: true },
  component: TournamentLayout,
});
