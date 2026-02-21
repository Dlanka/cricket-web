import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import {
  wicketFormSchema,
  type WicketFormValues,
} from "@/features/scoringPanel/schemas/scoringPanel.schemas";
import type {
  RunValue,
  WicketEventRequest,
  WicketExtraType,
} from "@/features/scoringPanel/types/scoringPanel.types";

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  runsWithWicket: RunValue;
  wicketExtraType: WicketExtraType;
  batterOptions: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (payload: WicketEventRequest) => Promise<void>;
};

const WICKET_TYPES = [
  { value: "bowled", label: "Bowled" },
  { value: "caught", label: "Caught" },
  { value: "lbw", label: "LBW" },
  { value: "stumping", label: "Stumping" },
  { value: "hitWicket", label: "Hit wicket" },
  { value: "runOutStriker", label: "Run out (striker)" },
  { value: "runOutNonStriker", label: "Run out (non-striker)" },
  { value: "obstructingField", label: "Obstructing the field" },
] as const;

export const WicketModal = ({
  isOpen,
  isSubmitting,
  runsWithWicket,
  wicketExtraType,
  batterOptions,
  onClose,
  onSubmit,
}: Props) => {
  const formId = "wicket-details-form";
  const form = useForm<WicketFormValues>({
    resolver: zodResolver(wicketFormSchema),
    defaultValues: {
      wicketType: "bowled",
      newBatterId: batterOptions[0]?.id ?? "",
      newBatterName: "",
      runOutBatsman: undefined,
      runsWithWicket,
    },
  });

  useEffect(() => {
    form.setValue("runsWithWicket", runsWithWicket);
  }, [form, runsWithWicket]);

  useEffect(() => {
    const selectedId = form.getValues("newBatterId");
    const exists = batterOptions.some((option) => option.id === selectedId);
    if (!exists) {
      form.setValue("newBatterId", batterOptions[0]?.id ?? "");
    }
  }, [batterOptions, form]);

  const wicketType = useWatch({
    control: form.control,
    name: "wicketType",
  });
  const showRunOutBatsman =
    wicketType === "runOutStriker" || wicketType === "runOutNonStriker";
  const wicketTypeOptions = WICKET_TYPES.map((type) => ({
    value: type.value,
    label: type.label,
  }));
  const runOutBatsmanOptions = [
    { value: "", label: "Select batter" },
    { value: "striker", label: "Striker" },
    { value: "nonStriker", label: "Non-striker" },
  ];
  const nextBatterOptions = [
    { value: "", label: "Select incoming batter" },
    ...batterOptions.map((player) => ({ value: player.id, label: player.name })),
  ];

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit({
        type: "wicket",
        wicketType: values.wicketType,
        extraType: wicketExtraType,
        newBatterId: values.newBatterId?.trim() || undefined,
        newBatterName: values.newBatterName?.trim() || undefined,
        runOutBatsman: values.runOutBatsman,
        runsWithWicket,
      });
      form.reset({
        wicketType: "bowled",
        newBatterId: batterOptions[0]?.id ?? "",
        newBatterName: "",
        runOutBatsman: undefined,
        runsWithWicket,
      });
      onClose();
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "score.new_batter_required") {
        form.setError("newBatterId", {
          type: "server",
          message: "Select next batter or enter a name.",
        });
      } else if (normalized.code === "score.wicket_extra_invalid") {
        form.setError("wicketType", {
          type: "server",
          message: "Selected wicket type is not valid for this extra type.",
        });
      }
    }
  });

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Wicket details"
      description="Capture how the batter got out."
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Confirm wicket"}
          </Button>
        </div>
      }
    >
      <form id={formId} className="space-y-4" onSubmit={submit}>
        <FormGroup label="Wicket type" error={form.formState.errors.wicketType?.message}>
          <SelectField options={wicketTypeOptions} {...form.register("wicketType")} />
        </FormGroup>

        {showRunOutBatsman ? (
          <FormGroup
            label="Run-out batter"
            error={form.formState.errors.runOutBatsman?.message}
          >
            <SelectField
              options={runOutBatsmanOptions}
              {...form.register("runOutBatsman")}
            />
          </FormGroup>
        ) : null}

        <FormGroup label="Next batter" error={form.formState.errors.newBatterId?.message}>
          <SelectField options={nextBatterOptions} {...form.register("newBatterId")} />
          <InputField
            type="text"
            placeholder="Fallback name (optional)"
            {...form.register("newBatterName")}
          />
        </FormGroup>

        <div className="rounded-xl border border-neutral-90 bg-neutral-99 px-3 py-2 text-xs text-neutral-40">
          Extra type: {wicketExtraType}
        </div>

        <div className="rounded-xl border border-neutral-90 bg-neutral-99 px-3 py-2 text-xs text-neutral-40">
          Runs on wicket ball: {runsWithWicket}
        </div>

      </form>
    </RightSideModal>
  );
};
