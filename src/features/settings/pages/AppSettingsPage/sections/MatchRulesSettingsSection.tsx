import { zodResolver } from "@hookform/resolvers/zod";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { Card } from "@/shared/components/card/Card";
import { SettingsSectionCard } from "@/features/settings/pages/AppSettingsPage/components/SettingsSectionCard";
import { useSettingsSectionForm } from "@/features/settings/hooks/useSettingsSectionForm";
import type { AppSettings, AppSettingsPatch } from "@/features/settings/types/settings.types";
import { matchRulesSettingsSchema } from "@/features/settings/schemas/settings.schemas";

type MatchRulesForm = {
  allowUndo: boolean;
  maxUndoWindowSec: number;
  lockRosterAfterStart: boolean;
  lockMatchConfigAfterStart: boolean;
  requireBothRostersBeforeStart: boolean;
};

const defaultValues: MatchRulesForm = {
  allowUndo: true,
  maxUndoWindowSec: 0,
  lockRosterAfterStart: true,
  lockMatchConfigAfterStart: true,
  requireBothRostersBeforeStart: true,
};

const mapSettingsToForm = (settings: AppSettings): MatchRulesForm => ({
  allowUndo: settings.matchRules.allowUndo,
  maxUndoWindowSec: settings.matchRules.maxUndoWindowSec,
  lockRosterAfterStart: settings.matchRules.lockRosterAfterStart,
  lockMatchConfigAfterStart: settings.matchRules.lockMatchConfigAfterStart,
  requireBothRostersBeforeStart: settings.matchRules.requireBothRostersBeforeStart,
});

const mapIssuePathToField = (path: string[]): keyof MatchRulesForm | undefined => {
  const key = path.join(".");
  const map: Record<string, keyof MatchRulesForm> = {
    "matchRules.allowUndo": "allowUndo",
    "matchRules.maxUndoWindowSec": "maxUndoWindowSec",
    "matchRules.lockRosterAfterStart": "lockRosterAfterStart",
    "matchRules.lockMatchConfigAfterStart": "lockMatchConfigAfterStart",
    "matchRules.requireBothRostersBeforeStart": "requireBothRostersBeforeStart",
  };
  return map[key];
};

const buildPayload = (
  values: MatchRulesForm,
  isFieldDirty: (field: keyof MatchRulesForm) => boolean,
): AppSettingsPatch => ({
  matchRules: {
    ...(isFieldDirty("allowUndo") ? { allowUndo: values.allowUndo } : {}),
    ...(isFieldDirty("maxUndoWindowSec")
      ? { maxUndoWindowSec: values.maxUndoWindowSec }
      : {}),
    ...(isFieldDirty("lockRosterAfterStart")
      ? { lockRosterAfterStart: values.lockRosterAfterStart }
      : {}),
    ...(isFieldDirty("lockMatchConfigAfterStart")
      ? { lockMatchConfigAfterStart: values.lockMatchConfigAfterStart }
      : {}),
    ...(isFieldDirty("requireBothRostersBeforeStart")
      ? { requireBothRostersBeforeStart: values.requireBothRostersBeforeStart }
      : {}),
  },
});

export const MatchRulesSettingsSection = () => {
  const section = useSettingsSectionForm<MatchRulesForm>({
    fields: [
      "allowUndo",
      "maxUndoWindowSec",
      "lockRosterAfterStart",
      "lockMatchConfigAfterStart",
      "requireBothRostersBeforeStart",
    ],
    defaultValues,
    resolver: zodResolver(matchRulesSettingsSchema),
    mapSettingsToForm,
    buildPayload,
    mapIssuePathToField,
    successMessage: "Match rules updated.",
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
      title="Match rules"
      canSave={section.isAdmin}
      isDirty={section.isDirty}
      isSaving={section.isSaving}
      onSave={() => void section.save()}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-primary-20">
          <input type="checkbox" {...register("allowUndo")} disabled={!section.isAdmin} />
          Allow undo
        </label>
        <label className="flex items-center gap-2 text-sm text-primary-20">
          <input
            type="checkbox"
            {...register("lockRosterAfterStart")}
            disabled={!section.isAdmin}
          />
          Lock roster after start
        </label>
        <label className="flex items-center gap-2 text-sm text-primary-20">
          <input
            type="checkbox"
            {...register("lockMatchConfigAfterStart")}
            disabled={!section.isAdmin}
          />
          Lock match config after start
        </label>
        <label className="flex items-center gap-2 text-sm text-primary-20">
          <input
            type="checkbox"
            {...register("requireBothRostersBeforeStart")}
            disabled={!section.isAdmin}
          />
          Require both rosters before start
        </label>
      </div>
      <FormGroup
        label="Max undo window (seconds)"
        error={formState.errors.maxUndoWindowSec?.message}
      >
        <InputField
          type="number"
          {...register("maxUndoWindowSec", { valueAsNumber: true })}
          disabled={!section.isAdmin}
        />
      </FormGroup>
    </SettingsSectionCard>
  );
};
