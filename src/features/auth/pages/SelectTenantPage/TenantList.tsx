import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { useLoginSessionStore } from "../../store/loginSessionStore";
import { useSelectTenantMutation } from "../../hooks/useSelectTenantMutation";

type Props = {
  onSuccess: () => void;
};

export const TenantList = ({ onSuccess }: Props) => {
  const { refreshMe } = useAuth();
  const { loginSessionToken, tenants, clearSession } = useLoginSessionStore(
    (state) => state,
  );
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const mutation = useSelectTenantMutation();

  const handleSelect = async (tenantId: string) => {
    if (!loginSessionToken) return;
    setSelectedTenant(tenantId);
    try {
      const payload = await mutation.mutateAsync({
        loginSessionToken,
        tenantId,
      });
      if (payload.mode !== "LOGGED_IN") {
        throw new Error("Unable to select tenant.");
      }
      clearSession();
      await refreshMe();
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to select tenant. Please try again.";
      toast.error(message);
    } finally {
      setSelectedTenant(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tenants.map((tenant) => (
        <button
          key={tenant.id}
          type="button"
          disabled={mutation.isPending}
          onClick={() => handleSelect(tenant.id)}
          className="group flex flex-col rounded-2xl border border-neutral-90 bg-neutral-99 px-6 py-5 text-left text-primary-10 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-neutral-80 hover:text-primary-10 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="text-sm font-semibold">{tenant.name}</span>
          <span className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-40">
            {tenant.role ?? "Member"}
          </span>
          {selectedTenant === tenant.id ? (
            <span className="mt-2 text-xs font-semibold text-neutral-50">
              Selecting...
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
};
