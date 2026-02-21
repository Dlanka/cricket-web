import { Outlet } from "@tanstack/react-router";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { UserSettingsNav } from "@/features/userSettings/pages/UserSettingsPage/components/UserSettingsNav";

export const UserSettingsPage = () => (
  <div className="mx-auto max-w-7xl space-y-6 py-6">
    <PageHeader
      eyebrow="Account"
      title="User Settings"
      description="Manage your profile, preferences, and account security."
    />

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <UserSettingsNav />
      <Outlet />
    </div>
  </div>
);
