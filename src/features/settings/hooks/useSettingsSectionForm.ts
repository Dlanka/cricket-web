import { useEffect, useMemo, useState } from "react";
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { getForbiddenMessage } from "@/features/authz/utils/forbidden";
import { useAppSettingsQuery } from "@/features/settings/hooks/useAppSettingsQuery";
import { usePatchAppSettingsMutation } from "@/features/settings/hooks/usePatchAppSettingsMutation";
import type {
  AppSettings,
  AppSettingsPatch,
} from "@/features/settings/types/settings.types";
import { normalizeApiError } from "@/shared/utils/apiErrors";

type ValidationIssue = {
  path?: string[];
  message?: string;
};

type UseSettingsSectionFormParams<TForm extends FieldValues> = {
  fields: Array<keyof TForm>;
  defaultValues: TForm;
  resolver?: Resolver<TForm>;
  mapSettingsToForm: (settings: AppSettings) => TForm;
  buildPayload: (
    values: TForm,
    isFieldDirty: (field: keyof TForm) => boolean,
  ) => AppSettingsPatch;
  mapIssuePathToField: (path: string[]) => keyof TForm | undefined;
  successMessage: string;
};

export const useSettingsSectionForm = <TForm extends FieldValues>({
  fields,
  defaultValues,
  resolver,
  mapSettingsToForm,
  buildPayload,
  mapIssuePathToField,
  successMessage,
}: UseSettingsSectionFormParams<TForm>) => {
  const { isOwner } = useAuth();
  const { can } = useAuthorization();
  const canManageTournament = can("tournament.manage") || Boolean(isOwner);
  const settingsQuery = useAppSettingsQuery();
  const patchMutation = usePatchAppSettingsMutation();
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<TForm>({
    defaultValues: defaultValues as DefaultValues<TForm>,
    resolver,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      form.reset(mapSettingsToForm(settingsQuery.data));
    }
  }, [form, mapSettingsToForm, settingsQuery.data]);

  const dirtyMap = form.formState.dirtyFields as Partial<Record<keyof TForm, unknown>>;
  const isFieldDirty = useMemo(
    () => (field: keyof TForm) => Boolean(dirtyMap[field]),
    [dirtyMap],
  );
  const isDirty = fields.some((field) => isFieldDirty(field));

  const save = async () => {
    if (!canManageTournament || !isDirty) return;

    form.clearErrors(fields as Path<TForm>[]);
    const values = form.getValues();
    const payload = buildPayload(values, isFieldDirty);

    try {
      setIsSaving(true);
      const updated = await patchMutation.mutateAsync(payload);
      form.reset(mapSettingsToForm(updated));
      toast.success(successMessage);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "validation.failed") {
        const rawIssues = (normalized.details as { issues?: unknown })?.issues;
        const issues = Array.isArray(rawIssues)
          ? (rawIssues as ValidationIssue[])
          : [];
        let applied = false;
        issues.forEach((issue) => {
          const field = issue.path ? mapIssuePathToField(issue.path) : undefined;
          if (field && fields.includes(field) && issue.message) {
            applied = true;
            form.setError(field as Path<TForm>, {
              type: "server",
              message: issue.message,
            });
          }
        });
        if (!applied) {
          toast.error(normalized.message || "Validation failed.");
        }
        return;
      }

      if (normalized.code === "auth.forbidden" || normalized.status === 403) {
        toast.error(getForbiddenMessage(error));
        return;
      }

      toast.error(normalized.message || "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isAdmin: canManageTournament,
    isSaving,
    isDirty,
    settingsQuery,
    form,
    save,
  };
};
