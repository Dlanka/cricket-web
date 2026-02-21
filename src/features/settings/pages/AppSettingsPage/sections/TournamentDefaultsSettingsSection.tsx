import { zodResolver } from "@hookform/resolvers/zod";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import { Card } from "@/shared/components/card/Card";
import { SettingsSectionCard } from "@/features/settings/pages/AppSettingsPage/components/SettingsSectionCard";
import { useSettingsSectionForm } from "@/features/settings/hooks/useSettingsSectionForm";
import type { AppSettings, AppSettingsPatch } from "@/features/settings/types/settings.types";
import { tournamentDefaultsSettingsSchema } from "@/features/settings/schemas/settings.schemas";

type DefaultsForm = {
  defaultType: AppSettings["tournamentDefaults"]["defaultType"];
  defaultOversPerInnings: number;
  defaultBallsPerOver: number;
  defaultQualificationCount: number;
  pointsWin: number;
  pointsTie: number;
  pointsNoResult: number;
  pointsLoss: number;
};

const defaultValues: DefaultsForm = {
  defaultType: "LEAGUE",
  defaultOversPerInnings: 20,
  defaultBallsPerOver: 6,
  defaultQualificationCount: 4,
  pointsWin: 2,
  pointsTie: 1,
  pointsNoResult: 1,
  pointsLoss: 0,
};

const mapSettingsToForm = (settings: AppSettings): DefaultsForm => ({
  defaultType: settings.tournamentDefaults.defaultType,
  defaultOversPerInnings: settings.tournamentDefaults.defaultOversPerInnings,
  defaultBallsPerOver: settings.tournamentDefaults.defaultBallsPerOver,
  defaultQualificationCount: settings.tournamentDefaults.defaultQualificationCount,
  pointsWin: settings.tournamentDefaults.points.win,
  pointsTie: settings.tournamentDefaults.points.tie,
  pointsNoResult: settings.tournamentDefaults.points.noResult,
  pointsLoss: settings.tournamentDefaults.points.loss,
});

const mapIssuePathToField = (path: string[]): keyof DefaultsForm | undefined => {
  const key = path.join(".");
  const map: Record<string, keyof DefaultsForm> = {
    "tournamentDefaults.defaultType": "defaultType",
    "tournamentDefaults.defaultOversPerInnings": "defaultOversPerInnings",
    "tournamentDefaults.defaultBallsPerOver": "defaultBallsPerOver",
    "tournamentDefaults.defaultQualificationCount": "defaultQualificationCount",
    "tournamentDefaults.points.win": "pointsWin",
    "tournamentDefaults.points.tie": "pointsTie",
    "tournamentDefaults.points.noResult": "pointsNoResult",
    "tournamentDefaults.points.loss": "pointsLoss",
  };
  return map[key];
};

const buildPayload = (
  values: DefaultsForm,
  isFieldDirty: (field: keyof DefaultsForm) => boolean,
): AppSettingsPatch => ({
  tournamentDefaults: {
    ...(isFieldDirty("defaultType") ? { defaultType: values.defaultType } : {}),
    ...(isFieldDirty("defaultOversPerInnings")
      ? { defaultOversPerInnings: values.defaultOversPerInnings }
      : {}),
    ...(isFieldDirty("defaultBallsPerOver")
      ? { defaultBallsPerOver: values.defaultBallsPerOver }
      : {}),
    ...(isFieldDirty("defaultQualificationCount")
      ? { defaultQualificationCount: values.defaultQualificationCount }
      : {}),
    ...((isFieldDirty("pointsWin") ||
      isFieldDirty("pointsTie") ||
      isFieldDirty("pointsNoResult") ||
      isFieldDirty("pointsLoss"))
      ? {
          points: {
            ...(isFieldDirty("pointsWin") ? { win: values.pointsWin } : {}),
            ...(isFieldDirty("pointsTie") ? { tie: values.pointsTie } : {}),
            ...(isFieldDirty("pointsNoResult")
              ? { noResult: values.pointsNoResult }
              : {}),
            ...(isFieldDirty("pointsLoss") ? { loss: values.pointsLoss } : {}),
          },
        }
      : {}),
  },
});

export const TournamentDefaultsSettingsSection = () => {
  const section = useSettingsSectionForm<DefaultsForm>({
    fields: [
      "defaultType",
      "defaultOversPerInnings",
      "defaultBallsPerOver",
      "defaultQualificationCount",
      "pointsWin",
      "pointsTie",
      "pointsNoResult",
      "pointsLoss",
    ],
    defaultValues,
    resolver: zodResolver(tournamentDefaultsSettingsSchema),
    mapSettingsToForm,
    buildPayload,
    mapIssuePathToField,
    successMessage: "Tournament defaults updated.",
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
      title="Tournament defaults"
      canSave={section.isAdmin}
      isDirty={section.isDirty}
      isSaving={section.isSaving}
      onSave={() => void section.save()}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormGroup label="Default type" error={formState.errors.defaultType?.message}>
          <SelectField
            {...register("defaultType")}
            disabled={!section.isAdmin}
            options={[
              { label: "League", value: "LEAGUE" },
              { label: "Knockout", value: "KNOCKOUT" },
              { label: "League + Knockout", value: "LEAGUE_KNOCKOUT" },
            ]}
          />
        </FormGroup>
        <FormGroup
          label="Overs per innings"
          error={formState.errors.defaultOversPerInnings?.message}
        >
          <InputField
            type="number"
            {...register("defaultOversPerInnings", { valueAsNumber: true })}
            disabled={!section.isAdmin}
          />
        </FormGroup>
        <FormGroup
          label="Balls per over"
          error={formState.errors.defaultBallsPerOver?.message}
        >
          <InputField
            type="number"
            {...register("defaultBallsPerOver", { valueAsNumber: true })}
            disabled={!section.isAdmin}
          />
        </FormGroup>
        <FormGroup
          label="Qualification count"
          error={formState.errors.defaultQualificationCount?.message}
        >
          <InputField
            type="number"
            {...register("defaultQualificationCount", { valueAsNumber: true })}
            disabled={!section.isAdmin}
          />
        </FormGroup>
        <FormGroup label="Points - Win" error={formState.errors.pointsWin?.message}>
          <InputField
            type="number"
            {...register("pointsWin", { valueAsNumber: true })}
            disabled={!section.isAdmin}
          />
        </FormGroup>
        <FormGroup label="Points - Tie" error={formState.errors.pointsTie?.message}>
          <InputField
            type="number"
            {...register("pointsTie", { valueAsNumber: true })}
            disabled={!section.isAdmin}
          />
        </FormGroup>
        <FormGroup
          label="Points - No result"
          error={formState.errors.pointsNoResult?.message}
        >
          <InputField
            type="number"
            {...register("pointsNoResult", { valueAsNumber: true })}
            disabled={!section.isAdmin}
          />
        </FormGroup>
        <FormGroup label="Points - Loss" error={formState.errors.pointsLoss?.message}>
          <InputField
            type="number"
            {...register("pointsLoss", { valueAsNumber: true })}
            disabled={!section.isAdmin}
          />
        </FormGroup>
      </div>
    </SettingsSectionCard>
  );
};
