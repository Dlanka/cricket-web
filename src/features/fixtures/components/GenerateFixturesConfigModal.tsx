import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import type { TournamentType } from "../../tournaments/types/tournamentTypes";
import type { TournamentConfigInput } from "../types/fixtures.types";
import { normalizeApiError } from "@/shared/utils/apiErrors";

type Props = {
  isOpen: boolean;
  isLocked: boolean;
  isSubmitting: boolean;
  teamsCount?: number;
  initialValues: {
    type?: TournamentType;
    oversPerInnings?: number;
    ballsPerOver?: number;
    qualificationCount?: number;
  };
  onClose: () => void;
  onSubmit: (payload: TournamentConfigInput) => Promise<void>;
};

const defaultType: TournamentType = "LEAGUE";

const schema = z
  .object({
    type: z.enum(["LEAGUE", "KNOCKOUT", "LEAGUE_KNOCKOUT"]),
    oversPerInnings: z.coerce
      .number()
      .int()
      .positive("Overs per innings must be greater than 0."),
    ballsPerOver: z.coerce
      .number()
      .int()
      .positive("Balls per over must be greater than 0."),
    qualificationCount: z.enum(["2", "4"]).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "LEAGUE_KNOCKOUT" && !value.qualificationCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["qualificationCount"],
        message: "Select teams advancing to knockout.",
      });
    }

    if (value.type !== "LEAGUE_KNOCKOUT" && value.qualificationCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["qualificationCount"],
        message: "Qualification count is only valid for League + Knockout.",
      });
    }
  });

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export const GenerateFixturesConfigModal = ({
  isOpen,
  isLocked,
  isSubmitting,
  teamsCount,
  initialValues,
  onClose,
  onSubmit,
}: Props) => {
  const formId = "generate-fixtures-config-form";
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    shouldUnregister: true,
    defaultValues: {
      type: initialValues.type ?? defaultType,
      oversPerInnings: initialValues.oversPerInnings ?? 20,
      ballsPerOver: initialValues.ballsPerOver ?? 6,
      qualificationCount:
        initialValues.qualificationCount === 2 ||
        initialValues.qualificationCount === 4
          ? String(initialValues.qualificationCount) as "2" | "4"
          : "4",
    },
  });

  const type = useWatch({
    control: form.control,
    name: "type",
  });
  const formError = form.formState.errors.root?.serverError?.message;
  const hasQualificationField = useMemo(
    () => type === "LEAGUE_KNOCKOUT",
    [type],
  );
  const teamsCountValue = teamsCount ?? 0;
  const isTeamsInsufficient = teamsCountValue < 2;
  const tournamentTypeOptions = useMemo(
    () => [
      { value: "LEAGUE", label: "League" },
      { value: "KNOCKOUT", label: "Knockout" },
      { value: "LEAGUE_KNOCKOUT", label: "League + Knockout" },
    ],
    [],
  );
  const qualificationOptions = useMemo(
    () => [
      { value: "2", label: "2 teams" },
      { value: "4", label: "4 teams", disabled: teamsCountValue < 4 },
    ],
    [teamsCountValue],
  );

  const submit = form.handleSubmit(async (values) => {
    if (isLocked) {
      return;
    }
    form.clearErrors("root.serverError");
    if (isTeamsInsufficient) {
      form.setError("root.serverError", {
        type: "manual",
        message: "At least 2 teams are required to generate fixtures.",
      });
      return;
    }

    if (values.type !== "LEAGUE_KNOCKOUT" && values.qualificationCount) {
      form.setError("qualificationCount", {
        type: "manual",
        message: "Qualification count is only valid for League + Knockout.",
      });
      return;
    }

    if (
      values.type === "LEAGUE_KNOCKOUT" &&
      (!values.qualificationCount || !["2", "4"].includes(values.qualificationCount))
    ) {
      form.setError("qualificationCount", {
        type: "manual",
        message: "Allowed values are 2 or 4.",
      });
      return;
    }

    const qualificationCount =
      values.type === "LEAGUE_KNOCKOUT" ? Number(values.qualificationCount) : undefined;

    if (
      values.type === "LEAGUE_KNOCKOUT" &&
      typeof qualificationCount === "number" &&
      qualificationCount > teamsCountValue
    ) {
      form.setError("qualificationCount", {
        type: "manual",
        message: `Cannot exceed registered teams (${teamsCountValue}).`,
      });
      return;
    }

    const payload: TournamentConfigInput = {
      type: values.type,
      oversPerInnings: values.oversPerInnings,
      ballsPerOver: values.ballsPerOver,
      ...(values.type === "LEAGUE_KNOCKOUT"
        ? {
            rules: {
              qualificationCount: qualificationCount ?? 2,
            },
          }
        : {}),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "validation.failed") {
        const issues =
          normalized.details &&
          typeof normalized.details === "object" &&
          "issues" in normalized.details &&
          Array.isArray((normalized.details as { issues?: unknown[] }).issues)
            ? (
                normalized.details as {
                  issues: Array<{ path?: unknown; message?: string }>;
                }
              ).issues
            : [];

        for (const issue of issues) {
          const path = Array.isArray(issue.path)
            ? issue.path.join(".")
            : String(issue.path ?? "");
          if (path.includes("type")) {
            form.setError("type", {
              type: "server",
              message: issue.message ?? "Invalid type.",
            });
          } else if (path.includes("oversPerInnings")) {
            form.setError("oversPerInnings", {
              type: "server",
              message: issue.message ?? "Invalid overs per innings.",
            });
          } else if (path.includes("ballsPerOver")) {
            form.setError("ballsPerOver", {
              type: "server",
              message: issue.message ?? "Invalid balls per over.",
            });
          } else if (path.includes("qualificationCount")) {
            form.setError("qualificationCount", {
              type: "server",
              message: issue.message ?? "Invalid qualification count.",
            });
          }
        }
        return;
      }
      if (normalized.code === "tournament.invalid_rules") {
        const details = normalized.details as
          | { qualificationCount?: { allowed?: number[]; max?: number } }
          | undefined;
        const allowedText = details?.qualificationCount?.allowed?.length
          ? `Allowed: ${details.qualificationCount.allowed.join(", ")}.`
          : "Allowed: 2 or 4.";
        const maxText =
          typeof details?.qualificationCount?.max === "number"
            ? ` Max by teams: ${details.qualificationCount.max}.`
            : "";
        form.setError("root.serverError", {
          type: "server",
          message: `Qualification count is valid only for League+Knockout. ${allowedText}${maxText}`,
        });
        return;
      }
      if (normalized.code === "tournament.config_locked") {
        form.setError("root.serverError", {
          type: "server",
          message:
            "Format/overs config is locked because fixtures already exist.",
        });
        return;
      }
      if (normalized.code === "match.already_exists") {
        form.setError("root.serverError", {
          type: "server",
          message: "Fixtures already generated.",
        });
        return;
      }
      form.setError("root.serverError", {
        type: "server",
        message: normalized.message || "Unable to generate fixtures.",
      });
    }
  });

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Tournament config"
      description="Review format and overs before generating fixtures."
      closeOnOverlayClick={!isSubmitting}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            size="sm"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            size="sm"
            disabled={isSubmitting || isLocked || isTeamsInsufficient}
          >
            {isSubmitting ? "Generating..." : "Save & generate"}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        {typeof teamsCount === "number" ? (
          <div className="rounded-xl border border-info-80 bg-info-95 px-3 py-2 text-sm text-info-20">
            Teams registered: <span className="font-semibold">{teamsCount}</span>
          </div>
        ) : null}
        {isTeamsInsufficient ? (
          <div className="rounded-xl border border-warning-80 bg-warning-95 px-3 py-2 text-sm text-warning-30">
            At least 2 teams are required to generate fixtures.
          </div>
        ) : null}

        <FormGroup
          label="Tournament type"
          hint="Choose how matches are structured (league stage, knockout, or both)."
          error={form.formState.errors.type?.message}
        >
          <SelectField
            options={tournamentTypeOptions}
            disabled={isSubmitting || isLocked}
            {...form.register("type")}
          />
        </FormGroup>

        {hasQualificationField ? (
          <FormGroup
            label="Teams advancing to knockout"
            hint="Allowed values are 2 or 4, and value cannot exceed team count."
            error={form.formState.errors.qualificationCount?.message}
          >
            <SelectField
              options={qualificationOptions}
              disabled={isSubmitting || isLocked}
              {...form.register("qualificationCount")}
            />
          </FormGroup>
        ) : null}

        <FormGroup
          label="Overs per innings"
          hint="Number of overs each team will bat in one innings."
          error={form.formState.errors.oversPerInnings?.message}
        >
          <InputField
            type="number"
            min={1}
            disabled={isSubmitting || isLocked}
            {...form.register("oversPerInnings", { valueAsNumber: true })}
          />
        </FormGroup>

        <FormGroup
          label="Balls per over"
          hint="Standard is 6 balls per over."
          error={form.formState.errors.ballsPerOver?.message}
        >
          <InputField
            type="number"
            min={1}
            disabled={isSubmitting || isLocked}
            {...form.register("ballsPerOver", { valueAsNumber: true })}
          />
        </FormGroup>

        {isLocked ? (
          <div className="rounded-xl border border-warning-80 bg-warning-95 px-3 py-2 text-sm text-warning-30">
            Format/overs config is locked because fixtures already exist.
          </div>
        ) : null}

        {formError ? (
          <div className="rounded-xl border border-error-80 bg-error-95 px-3 py-2 text-sm text-error-40">
            {formError}
          </div>
        ) : null}
      </form>
    </RightSideModal>
  );
};
