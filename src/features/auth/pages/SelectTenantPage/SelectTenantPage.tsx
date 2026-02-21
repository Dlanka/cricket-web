import { useNavigate } from "@tanstack/react-router";
import { useLoginSessionStore } from "../../store/loginSessionStore";
import { TenantList } from "./TenantList";
import { SelectTenantPageSkeleton } from "./SelectTenantPage.skeleton";
import { Button } from "@/components/ui/button/Button";

export const SelectTenantPage = () => {
  const navigate = useNavigate();
  const { loginSessionToken, tenants } = useLoginSessionStore((state) => state);

  if (!loginSessionToken) {
    return (
      <div className="min-h-screen w-full px-6 py-10">
        <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center">
          <div className="w-full rounded-2xl border border-neutral-90 bg-neutral-98 p-6 text-sm text-neutral-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
            <p className="font-semibold text-primary-10">No active login session.</p>
            <p className="mt-2">Please sign in again to continue.</p>
            <Button
              type="button"
              onClick={() => navigate({ to: "/login", replace: true })}
              className="mt-4"
              appearance="filled"
              color="primary"
              size="md"
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="min-h-screen w-full px-6 py-10">
        <div className="mx-auto flex min-h-full w-full max-w-4xl items-center justify-center">
          <SelectTenantPageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-6 py-10">
      <div className="mx-auto flex min-h-full w-full max-w-4xl items-center justify-center">
        <div className="w-full space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
              Select tenant
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-primary-10">
              Choose the organization you want to manage.
            </h1>
            <p className="mt-2 text-sm text-neutral-40">
              Your access is ready. Select a tenant to continue.
            </p>
          </div>
          <TenantList onSuccess={() => navigate({ to: "/dashboard", replace: true })} />
        </div>
      </div>
    </div>
  );
};
