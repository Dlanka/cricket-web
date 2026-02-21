import { createFileRoute } from "@tanstack/react-router";
import { SelectTenantPage } from "../features/auth/pages/SelectTenantPage/SelectTenantPage";

export const Route = createFileRoute("/select-tenant")({
  component: SelectTenantPage,
  staticData: { title: "Select tenant", requiresAuth: false },
});
