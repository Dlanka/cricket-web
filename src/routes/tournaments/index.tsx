import { createFileRoute } from "@tanstack/react-router";
import { TournamentsListPage } from "../../features/tournaments/pages/TournamentsListPage/TournamentsListPage";
import { requireAuthed } from "../_auth";

export const Route = createFileRoute("/tournaments/")({
  component: TournamentsListPage,
  staticData: { title: "Tournaments", requiresAuth: true },
  beforeLoad: requireAuthed,
});
