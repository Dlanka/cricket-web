import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/Button";
import { Card } from "@/shared/components/card/Card";
import { SettingsSectionCard } from "@/features/settings/pages/AppSettingsPage/components/SettingsSectionCard";
import { useSettingsSectionForm } from "@/features/settings/hooks/useSettingsSectionForm";
import type {
  AppSettings,
  AppSettingsPatch,
  PermissionCode,
} from "@/features/settings/types/settings.types";
import { permissionsSettingsSchema } from "@/features/settings/schemas/settings.schemas";

type PermissionsForm = {
  permissionsAdmin: PermissionCode[];
  permissionsScorer: PermissionCode[];
  permissionsViewer: PermissionCode[];
};

const defaultValues: PermissionsForm = {
  permissionsAdmin: ["*"],
  permissionsScorer: [
    "roster.manage",
    "match.start",
    "score.write",
    "bowler.change",
  ],
  permissionsViewer: [],
};

const mapSettingsToForm = (settings: AppSettings): PermissionsForm => ({
  permissionsAdmin: settings.permissions.ADMIN,
  permissionsScorer: settings.permissions.SCORER,
  permissionsViewer: settings.permissions.VIEWER,
});

const mapIssuePathToField = (
  path: string[],
): keyof PermissionsForm | undefined => {
  const key = path.join(".");
  const map: Record<string, keyof PermissionsForm> = {
    "permissions.ADMIN": "permissionsAdmin",
    "permissions.SCORER": "permissionsScorer",
    "permissions.VIEWER": "permissionsViewer",
  };
  return map[key];
};

const permissionLabels: Record<PermissionCode, string> = {
  "*": "Full access",
  "tournament.manage": "Manage tournaments",
  "fixture.generate": "Generate fixtures",
  "roster.manage": "Manage rosters",
  "match.start": "Start matches",
  "score.write": "Update scoring",
  "bowler.change": "Change current bowler",
};
const permissionGroups: Array<{ title: string; items: PermissionCode[] }> = [
  { title: "Global", items: ["*"] },
  { title: "Tournament", items: ["tournament.manage", "fixture.generate"] },
  { title: "Match & Roster", items: ["roster.manage", "match.start"] },
  { title: "Scoring", items: ["score.write", "bowler.change"] },
];

export const PermissionsSettingsSection = () => {
  const section = useSettingsSectionForm<PermissionsForm>({
    fields: ["permissionsAdmin", "permissionsScorer", "permissionsViewer"],
    defaultValues,
    resolver: zodResolver(permissionsSettingsSchema),
    mapSettingsToForm,
    buildPayload: (values, isFieldDirty): AppSettingsPatch => ({
      permissions: {
        ...(isFieldDirty("permissionsAdmin")
          ? { ADMIN: values.permissionsAdmin }
          : {}),
        ...(isFieldDirty("permissionsScorer")
          ? { SCORER: values.permissionsScorer }
          : {}),
        ...(isFieldDirty("permissionsViewer")
          ? { VIEWER: values.permissionsViewer }
          : {}),
      },
    }),
    mapIssuePathToField,
    successMessage: "Permissions updated.",
  });

  const { getValues, setValue, formState } = section.form;

  const togglePermission = (
    field: keyof PermissionsForm,
    permission: PermissionCode,
    checked: boolean,
  ) => {
    const current = getValues(field);
    let next: PermissionCode[];

    if (permission === "*") {
      next = checked ? ["*"] : [];
    } else if (checked) {
      next = Array.from(
        new Set(current.filter((item) => item !== "*").concat(permission)),
      );
    } else {
      next = current.filter((item) => item !== permission);
    }

    setValue(field, next, { shouldDirty: true, shouldValidate: true });
  };

  const roleConfigs: Array<{
    field: keyof PermissionsForm;
    label: string;
  }> = [
    { field: "permissionsAdmin", label: "ADMIN" },
    { field: "permissionsScorer", label: "SCORER" },
    { field: "permissionsViewer", label: "VIEWER" },
  ];
  const selectedAdmin = getValues("permissionsAdmin");
  const selectedScorer = getValues("permissionsScorer");
  const selectedViewer = getValues("permissionsViewer");
  const hasAdminFullAccess = selectedAdmin.includes("*");
  const hasScorerFullAccess = selectedScorer.includes("*");
  const hasViewerFullAccess = selectedViewer.includes("*");
  const adminCount = selectedAdmin.includes("*") ? 1 : selectedAdmin.length;
  const scorerCount = selectedScorer.includes("*") ? 1 : selectedScorer.length;
  const viewerCount = selectedViewer.includes("*") ? 1 : selectedViewer.length;
  const isDefaultRolePermissions = (
    current: PermissionCode[],
    defaults: PermissionCode[],
  ) =>
    current.length === defaults.length &&
    current.every((code) => defaults.includes(code));
  const isAtDefaults =
    isDefaultRolePermissions(selectedAdmin, defaultValues.permissionsAdmin) &&
    isDefaultRolePermissions(selectedScorer, defaultValues.permissionsScorer) &&
    isDefaultRolePermissions(selectedViewer, defaultValues.permissionsViewer);

  const resetToDefaults = () => {
    setValue("permissionsAdmin", defaultValues.permissionsAdmin, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("permissionsScorer", defaultValues.permissionsScorer, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("permissionsViewer", defaultValues.permissionsViewer, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (section.settingsQuery.isLoading) {
    return (
      <Card className="p-6 text-sm text-neutral-40">Loading settings...</Card>
    );
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
      title="Permissions"
      canSave={section.isAdmin}
      isDirty={section.isDirty}
      isSaving={section.isSaving}
      onSave={() => void section.save()}
      actions={
        <Button
          type="button"
          size="sm"
          appearance="outline"
          color="neutral"
          disabled={!section.isAdmin || isAtDefaults}
          onClick={resetToDefaults}
        >
          Reset to defaults
        </Button>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-40">
          Enable permissions by role. This controls what each role can do in the
          app.
        </p>
        <p className="text-xs text-neutral-40">
          Full access overrides all other permissions for that role.
        </p>
        <div className="overflow-x-auto rounded-xl border border-neutral-90">
          <table className="w-full min-w-155 text-sm">
            <thead>
              <tr className="bg-neutral-98 text-xs uppercase tracking-[0.12em] text-neutral-40">
                <th className="px-3 py-2 text-left">Permission</th>
                <th className="w-28 px-3 py-2 text-center">Admin ({adminCount})</th>
                <th className="w-28 px-3 py-2 text-center">Scorer ({scorerCount})</th>
                <th className="w-28 px-3 py-2 text-center">Viewer ({viewerCount})</th>
              </tr>
            </thead>
            <tbody>
              {permissionGroups.flatMap((group) => [
                <tr
                  key={`${group.title}-header`}
                  className="border-t border-neutral-90 bg-neutral-99"
                >
                  <td
                    colSpan={4}
                    className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-40"
                  >
                    {group.title}
                  </td>
                </tr>,
                ...group.items.map((permission) => (
                  <tr
                    key={permission}
                    className="border-t border-neutral-90 transition-colors hover:bg-neutral-98"
                  >
                    <td className="px-3 py-2 pl-7 text-primary-20">
                      {permissionLabels[permission]}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedAdmin.includes(permission)}
                        onChange={(event) =>
                          togglePermission(
                            "permissionsAdmin",
                            permission,
                            event.currentTarget.checked,
                          )
                        }
                        disabled={
                          !section.isAdmin ||
                          (permission !== "*" && hasAdminFullAccess)
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedScorer.includes(permission)}
                        onChange={(event) =>
                          togglePermission(
                            "permissionsScorer",
                            permission,
                            event.currentTarget.checked,
                          )
                        }
                        disabled={
                          !section.isAdmin || (permission !== "*" && hasScorerFullAccess)
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedViewer.includes(permission)}
                        onChange={(event) =>
                          togglePermission(
                            "permissionsViewer",
                            permission,
                            event.currentTarget.checked,
                          )
                        }
                        disabled={
                          !section.isAdmin || (permission !== "*" && hasViewerFullAccess)
                        }
                      />
                    </td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
        {roleConfigs.map((roleConfig) => {
          const roleError = formState.errors[roleConfig.field]?.message;
          return roleError ? (
            <p
              key={roleConfig.field}
              className="pl-1 text-xs font-semibold text-error-40"
            >
              {roleConfig.label}: {roleError}
            </p>
          ) : null;
        })}
      </div>
    </SettingsSectionCard>
  );
};
