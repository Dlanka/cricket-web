import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { SettingsSectionCard } from "@/features/settings/pages/AppSettingsPage/components/SettingsSectionCard";
import { Card } from "@/shared/components/card/Card";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { BadgePill } from "@/shared/components/badge/BadgePill";
import { RoleBadge } from "@/shared/components/badge/RoleBadge";
import { useMeSettingsQuery } from "@/features/userSettings/hooks/useMeSettingsQuery";
import { usePatchMeSettingsMutation } from "@/features/userSettings/hooks/usePatchMeSettingsMutation";
import { profileSettingsSchema } from "@/features/userSettings/schemas/userSettings.schemas";
import type { z } from "zod";
import { normalizeApiError } from "@/shared/utils/apiErrors";

type ProfileFormValues = z.infer<typeof profileSettingsSchema>;

const permissionLabelByCode: Record<string, string> = {
  "*": "Full access",
  "tournament.manage": "Manage tournaments",
  "fixture.generate": "Generate fixtures",
  "roster.manage": "Manage rosters",
  "match.start": "Start matches",
  "score.write": "Update scoring",
  "bowler.change": "Change current bowler",
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return format(parsed, "d MMM yyyy");
};

export const ProfileSettingsSection = () => {
  const settingsQuery = useMeSettingsQuery();
  const patchMutation = usePatchMeSettingsMutation();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;
    form.reset({
      fullName: settingsQuery.data.profile.fullName ?? "",
      email: settingsQuery.data.profile.email ?? "",
    });
  }, [form, settingsQuery.data]);

  const onSave = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    if (!form.formState.dirtyFields.fullName) return;

    try {
      await patchMutation.mutateAsync({
        profile: { fullName: form.getValues("fullName") },
      });
      toast.success("Profile updated.");
      if (settingsQuery.data) {
        form.reset({
          fullName: form.getValues("fullName"),
          email: settingsQuery.data.profile.email ?? "",
        });
      }
    } catch (error) {
      toast.error(
        normalizeApiError(error).message || "Unable to update profile.",
      );
    }
  };

  if (settingsQuery.isLoading) {
    return (
      <Card className="p-6 text-sm text-on-surface-variant">Loading profile...</Card>
    );
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <Card className="p-6 text-sm text-on-error-container">
        {settingsQuery.error instanceof Error
          ? settingsQuery.error.message
          : "Unable to load profile settings."}
      </Card>
    );
  }

  const data = settingsQuery.data;

  return (
    <SettingsSectionCard
      title="Profile"
      canSave
      isSaving={patchMutation.isPending}
      isDirty={Boolean(form.formState.dirtyFields.fullName)}
      onSave={() => void onSave()}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormGroup
            label="Full name"
            error={form.formState.errors.fullName?.message}
          >
            <InputField type="text" {...form.register("fullName")} />
          </FormGroup>
          <FormGroup label="Email">
            <InputField type="email" {...form.register("email")} disabled />
          </FormGroup>
        </div>

        <div className="rounded-xl border border-outline p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Tenant context
          </p>
          <div className="mt-2 overflow-hidden rounded-lg border border-outline">
            <div className="grid table-cols-label-value gap-3 border-t border-outline px-3 py-2 text-sm text-on-primary-container first:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Tenant
              </p>
              <p className="font-semibold">{data.tenantContext.current.name}</p>
            </div>
            <div className="grid table-cols-label-value gap-3 border-t border-outline px-3 py-2 text-sm text-on-primary-container">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Role
              </p>
              <div className="">
                <RoleBadge role={data.tenantContext.current.role} />
              </div>
            </div>
            <div className="grid table-cols-label-value gap-3 border-t border-outline px-3 py-2 text-sm text-on-primary-container">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Owner
              </p>
              <p>{data.tenantContext.current.isOwner ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-outline p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Account
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-on-primary-container md:grid-cols-3">
            <p>Status: {data.account.status}</p>
            <p>Created: {formatDate(data.account.createdAt)}</p>
            <p>Last login: {formatDate(data.account.lastLoginAt)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-outline p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Memberships
          </p>
          <div className="mt-2 overflow-hidden rounded-lg border border-outline">
            <div className="grid table-cols-auto-end bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <p>Name</p>
              <p>Status</p>
            </div>
            {data.tenantContext.memberships.map((membership) => (
              <div
                key={membership.tenantId}
                className="grid table-cols-auto-end items-center gap-3 border-t border-outline px-3 py-2 text-sm text-on-primary-container"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {membership.tenantName}
                  </p>
                  <p className="text-xs text-on-surface-variant">{membership.role}</p>
                </div>
                <BadgePill label={membership.membershipStatus} tone="warning" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-outline p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Permissions
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.authorization.permissions.length ? (
              data.authorization.permissions.map((permission) => (
                <BadgePill
                  key={permission}
                  label={permissionLabelByCode[permission] ?? permission}
                  tone="neutral"
                />
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">
                No permissions assigned.
              </p>
            )}
          </div>
        </div>
      </div>
    </SettingsSectionCard>
  );
};



