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
  retireFormSchema,
  type RetireFormValues,
} from "@/features/scoringPanel/schemas/scoringPanel.schemas";
import type { RetireRequest } from "../types/scoringPanel.types";

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  batterOptions: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (payload: RetireRequest) => Promise<void>;
};

export const RetireModal = ({
  isOpen,
  isSubmitting,
  batterOptions,
  onClose,
  onSubmit,
}: Props) => {
  const formId = "retire-batter-form";
  const form = useForm<RetireFormValues>({
    resolver: zodResolver(retireFormSchema),
    defaultValues: {
      retiringBatter: "striker",
      newBatterId: "",
      newBatterName: "",
      reason: "",
    },
  });

  useEffect(() => {
    const selectedId = form.getValues("newBatterId");
    const exists = batterOptions.some((option) => option.id === selectedId);
    if (!exists && selectedId) {
      form.setValue("newBatterId", "");
    }
  }, [batterOptions, form]);

  const submit = form.handleSubmit(async (values) => {
    const hasDropdownOptions = batterOptions.length > 0;
    const nextBatterId = values.newBatterId?.trim();
    const nextBatterName = values.newBatterName?.trim();

    if (hasDropdownOptions && !nextBatterId) {
      form.setError("newBatterId", {
        type: "manual",
        message: "Select next batter.",
      });
      return;
    }

    if (!hasDropdownOptions && !nextBatterName) {
      form.setError("newBatterName", {
        type: "manual",
        message: "Enter next batter name.",
      });
      return;
    }

    try {
      await onSubmit({
        type: "retire",
        retiringBatter: values.retiringBatter,
        newBatterId: nextBatterId || undefined,
        newBatterName: nextBatterName || undefined,
        reason: values.reason || undefined,
      });
      form.reset({
        retiringBatter: "striker",
        newBatterId: "",
        newBatterName: "",
        reason: "",
      });
      onClose();
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "score.new_batter_required") {
        form.setError("newBatterId", {
          type: "server",
          message: "Select next batter or enter a name.",
        });
      }
    }
  });

  const selectedNewBatterId = useWatch({
    control: form.control,
    name: "newBatterId",
  })?.trim() ?? "";
  const fallbackNewBatterName = useWatch({
    control: form.control,
    name: "newBatterName",
  })?.trim() ?? "";
  const hasDropdownOptions = batterOptions.length > 0;
  const canSubmit =
    !isSubmitting &&
    (hasDropdownOptions
      ? Boolean(selectedNewBatterId)
      : Boolean(fallbackNewBatterName));
  const retiringBatterOptions = [
    { value: "striker", label: "Striker" },
    { value: "nonStriker", label: "Non-striker" },
  ];
  const nextBatterOptions = [
    { value: "", label: "Select incoming batter" },
    ...batterOptions.map((player) => ({ value: player.id, label: player.name })),
  ];

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Retire batter"
      description="Pick who retires and who comes in next."
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
            disabled={!canSubmit}
          >
            {isSubmitting ? "Saving..." : "Confirm retire"}
          </Button>
        </div>
      }
    >
      <form id={formId} className="space-y-4" onSubmit={submit}>
        <FormGroup label="Retiring batter">
          <SelectField
            options={retiringBatterOptions}
            {...form.register("retiringBatter")}
          />
        </FormGroup>

        <FormGroup label="Next batter" error={form.formState.errors.newBatterId?.message}>
          <SelectField
            options={nextBatterOptions}
            {...form.register("newBatterId")}
          />
          <InputField
            type="text"
            placeholder="Fallback name (optional)"
            {...form.register("newBatterName")}
          />
        </FormGroup>

        <FormGroup label="Reason (optional)">
          <InputField
            type="text"
            placeholder="Retired hurt"
            {...form.register("reason")}
          />
        </FormGroup>

      </form>
    </RightSideModal>
  );
};
