import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireAuthed } from "./_auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    await requireAuthed();
    throw redirect({ to: "/" });
  },
  staticData: { requiresAuth: true },
});
