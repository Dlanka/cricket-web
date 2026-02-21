import { createFileRoute } from "@tanstack/react-router";
import { ForbiddenPage } from "@/features/core/pages/ForbiddenPage/ForbiddenPage";

export const Route = createFileRoute("/forbidden")({
  component: ForbiddenPage,
  staticData: { title: "Forbidden", requiresAuth: true },
});
