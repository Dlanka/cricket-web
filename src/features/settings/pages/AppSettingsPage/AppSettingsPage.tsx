import { Outlet } from "@tanstack/react-router";
import { SettingsNav } from "@/features/settings/pages/AppSettingsPage/components/SettingsNav";
import { PageHeader } from "@/shared/components/page/PageHeader";

export const AppSettingsPage = () => (
  <div className="mx-auto max-w-7xl space-y-6 py-6">
    <PageHeader
      eyebrow="Administration"
      title="Settings"
      description="Tenant-level defaults and permissions."
    />

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <SettingsNav />
      <Outlet />
    </div>
  </div>
);
