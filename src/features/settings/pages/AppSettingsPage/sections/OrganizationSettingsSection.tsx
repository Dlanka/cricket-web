import { zodResolver } from "@hookform/resolvers/zod";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { Card } from "@/shared/components/card/Card";
import type { AppSettings, AppSettingsPatch } from "@/features/settings/types/settings.types";
import { SettingsSectionCard } from "@/features/settings/pages/AppSettingsPage/components/SettingsSectionCard";
import { useSettingsSectionForm } from "@/features/settings/hooks/useSettingsSectionForm";
import { organizationSettingsSchema } from "@/features/settings/schemas/settings.schemas";

type OrganizationForm = {
  tenantName: string;
  timezone: string;
  locale: string;
  dateFormat: string;
  logoUrl: string;
};

const defaultValues: OrganizationForm = {
  tenantName: "",
  timezone: "",
  locale: "",
  dateFormat: "",
  logoUrl: "",
};

const mapSettingsToForm = (settings: AppSettings): OrganizationForm => ({
  tenantName: settings.organization.tenantName,
  timezone: settings.organization.timezone,
  locale: settings.organization.locale,
  dateFormat: settings.organization.dateFormat,
  logoUrl: settings.organization.logoUrl ?? "",
});

const mapIssuePathToField = (path: string[]): keyof OrganizationForm | undefined => {
  const key = path.join(".");
  const map: Record<string, keyof OrganizationForm> = {
    "organization.tenantName": "tenantName",
    "organization.timezone": "timezone",
    "organization.locale": "locale",
    "organization.dateFormat": "dateFormat",
    "organization.logoUrl": "logoUrl",
  };
  return map[key];
};

const buildPayload = (
  values: OrganizationForm,
  isFieldDirty: (field: keyof OrganizationForm) => boolean,
): AppSettingsPatch => ({
  organization: {
    ...(isFieldDirty("tenantName") ? { tenantName: values.tenantName } : {}),
    ...(isFieldDirty("timezone") ? { timezone: values.timezone } : {}),
    ...(isFieldDirty("locale") ? { locale: values.locale } : {}),
    ...(isFieldDirty("dateFormat") ? { dateFormat: values.dateFormat } : {}),
    ...(isFieldDirty("logoUrl")
      ? { logoUrl: values.logoUrl.trim() || null }
      : {}),
  },
});

export const OrganizationSettingsSection = () => {
  const section = useSettingsSectionForm<OrganizationForm>({
    fields: ["tenantName", "timezone", "locale", "dateFormat", "logoUrl"],
    defaultValues,
    resolver: zodResolver(organizationSettingsSchema),
    mapSettingsToForm,
    buildPayload,
    mapIssuePathToField,
    successMessage: "Organization updated.",
  });

  const { register, formState } = section.form;

  if (section.settingsQuery.isLoading) {
    return <Card className="p-6 text-sm text-neutral-40">Loading settings...</Card>;
  }

  if (section.settingsQuery.isError) {
    return (
      <Card className="p-6 text-sm text-error-40">
        {section.settingsQuery.error instanceof Error
          ? section.settingsQuery.error.message
          : "Unable to load settings."}
      </Card>
    );
  }

  return (
    <SettingsSectionCard
      title="Organization"
      canSave={section.isAdmin}
      isDirty={section.isDirty}
      isSaving={section.isSaving}
      onSave={() => void section.save()}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormGroup label="Tenant name" error={formState.errors.tenantName?.message}>
          <InputField {...register("tenantName")} disabled={!section.isAdmin} />
        </FormGroup>
        <FormGroup label="Timezone" error={formState.errors.timezone?.message}>
          <InputField {...register("timezone")} disabled={!section.isAdmin} />
        </FormGroup>
        <FormGroup label="Locale" error={formState.errors.locale?.message}>
          <InputField {...register("locale")} disabled={!section.isAdmin} />
        </FormGroup>
        <FormGroup label="Date format" error={formState.errors.dateFormat?.message}>
          <InputField {...register("dateFormat")} disabled={!section.isAdmin} />
        </FormGroup>
        <FormGroup label="Logo URL" error={formState.errors.logoUrl?.message}>
          <InputField {...register("logoUrl")} disabled={!section.isAdmin} />
        </FormGroup>
      </div>
    </SettingsSectionCard>
  );
};
