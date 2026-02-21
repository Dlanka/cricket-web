import { createFileRoute } from "@tanstack/react-router";
import { requireAuthed } from "@/routes/_auth";
import { UserSettingsPage } from "@/features/userSettings/pages/UserSettingsPage/UserSettingsPage";

export const Route = createFileRoute("/user-settings")({
  component: UserSettingsPage,
  beforeLoad: requireAuthed,
  staticData: { title: "User settings", requiresAuth: true },
});
