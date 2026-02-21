import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { SettingsSectionCard } from "@/features/settings/pages/AppSettingsPage/components/SettingsSectionCard";
import { Card } from "@/shared/components/card/Card";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import { useMeSettingsQuery } from "@/features/userSettings/hooks/useMeSettingsQuery";
import { usePatchMeSettingsMutation } from "@/features/userSettings/hooks/usePatchMeSettingsMutation";
import { preferencesSettingsSchema } from "@/features/userSettings/schemas/userSettings.schemas";
import { normalizeApiError } from "@/shared/utils/apiErrors";

type PreferencesFormValues = z.infer<typeof preferencesSettingsSchema>;

const themeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export const PreferencesSettingsSection = () => {
  const settingsQuery = useMeSettingsQuery();
  const patchMutation = usePatchMeSettingsMutation();
  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSettingsSchema),
    defaultValues: {
      locale: "en-US",
      timezone: "UTC",
      dateFormat: "YYYY-MM-DD",
      theme: "system",
      notificationsEmail: true,
      notificationsInApp: true,
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) return;
    form.reset({
      locale: settingsQuery.data.preferences.locale,
      timezone: settingsQuery.data.preferences.timezone,
      dateFormat: settingsQuery.data.preferences.dateFormat,
      theme: settingsQuery.data.preferences.theme,
      notificationsEmail: settingsQuery.data.preferences.notifications.email,
      notificationsInApp: settingsQuery.data.preferences.notifications.inApp,
    });
  }, [form, settingsQuery.data]);

  const onSave = async () => {
    const valid = await form.trigger();
    if (!valid) return;

    const dirty = form.formState.dirtyFields;
    const values = form.getValues();
    const payload = {
      preferences: {
        ...(dirty.locale ? { locale: values.locale } : {}),
        ...(dirty.timezone ? { timezone: values.timezone } : {}),
        ...(dirty.dateFormat ? { dateFormat: values.dateFormat } : {}),
        ...(dirty.theme ? { theme: values.theme } : {}),
        ...((dirty.notificationsEmail || dirty.notificationsInApp)
          ? {
              notifications: {
                ...(dirty.notificationsEmail ? { email: values.notificationsEmail } : {}),
                ...(dirty.notificationsInApp ? { inApp: values.notificationsInApp } : {}),
              },
            }
          : {}),
      },
    };

    const hasChanges =
      Object.keys(payload.preferences).length > 0 &&
      !(
        Object.keys(payload.preferences).length === 1 &&
        "notifications" in payload.preferences &&
        Object.keys(payload.preferences.notifications ?? {}).length === 0
      );
    if (!hasChanges) return;

    try {
      const updated = await patchMutation.mutateAsync(payload);
      form.reset({
        locale: updated.preferences.locale,
        timezone: updated.preferences.timezone,
        dateFormat: updated.preferences.dateFormat,
        theme: updated.preferences.theme,
        notificationsEmail: updated.preferences.notifications.email,
        notificationsInApp: updated.preferences.notifications.inApp,
      });
      toast.success("Preferences updated.");
    } catch (error) {
      toast.error(normalizeApiError(error).message || "Unable to update preferences.");
    }
  };

  if (settingsQuery.isLoading) {
    return <Card className="p-6 text-sm text-neutral-40">Loading preferences...</Card>;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <Card className="p-6 text-sm text-error-40">
        {settingsQuery.error instanceof Error
          ? settingsQuery.error.message
          : "Unable to load preferences."}
      </Card>
    );
  }

  return (
    <SettingsSectionCard
      title="Preferences"
      canSave
      isSaving={patchMutation.isPending}
      isDirty={form.formState.isDirty}
      onSave={() => void onSave()}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormGroup label="Locale" error={form.formState.errors.locale?.message}>
          <InputField type="text" {...form.register("locale")} />
        </FormGroup>
        <FormGroup label="Timezone" error={form.formState.errors.timezone?.message}>
          <InputField type="text" {...form.register("timezone")} />
        </FormGroup>
        <FormGroup label="Date format" error={form.formState.errors.dateFormat?.message}>
          <InputField type="text" {...form.register("dateFormat")} />
        </FormGroup>
        <FormGroup label="Theme" error={form.formState.errors.theme?.message}>
          <SelectField options={themeOptions} {...form.register("theme")} />
        </FormGroup>
        <FormGroup label="Email notifications">
          <label className="flex h-10 items-center">
            <input type="checkbox" {...form.register("notificationsEmail")} />
          </label>
        </FormGroup>
        <FormGroup label="In-app notifications">
          <label className="flex h-10 items-center">
            <input type="checkbox" {...form.register("notificationsInApp")} />
          </label>
        </FormGroup>
      </div>
    </SettingsSectionCard>
  );
};
