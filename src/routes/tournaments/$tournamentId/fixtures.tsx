import { createFileRoute } from "@tanstack/react-router";
import { TournamentFixturesPage } from "@/features/fixtures/pages/TournamentFixtures/TournamentFixturesPage";

export const Route = createFileRoute("/tournaments/$tournamentId/fixtures")({
  component: TournamentFixturesPage,
  staticData: { title: "Fixtures", requiresAuth: true },
});
