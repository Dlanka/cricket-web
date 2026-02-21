import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { SettingsSectionCard } from "@/features/settings/pages/AppSettingsPage/components/SettingsSectionCard";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { Card } from "@/shared/components/card/Card";
import { usePatchMyPasswordMutation } from "@/features/userSettings/hooks/usePatchMyPasswordMutation";
import { securitySettingsSchema } from "@/features/userSettings/schemas/userSettings.schemas";
import { normalizeApiError } from "@/shared/utils/apiErrors";

type SecurityFormValues = z.infer<typeof securitySettingsSchema>;

export const SecuritySettingsSection = () => {
  const mutation = usePatchMyPasswordMutation();
  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSave = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed.");
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "auth.invalid_current_password") {
        form.setError("currentPassword", {
          type: "server",
          message: "Current password is invalid.",
        });
        return;
      }
      toast.error(normalized.message || "Unable to change password.");
    }
  });

  return (
    <SettingsSectionCard
      title="Security"
      canSave
      isSaving={mutation.isPending}
      isDirty={form.formState.isDirty}
      onSave={() => void onSave()}
    >
      <Card className="space-y-4 border border-neutral-90">
        <FormGroup
          label="Current password"
          error={form.formState.errors.currentPassword?.message}
        >
          <InputField type="password" {...form.register("currentPassword")} />
        </FormGroup>
        <FormGroup
          label="New password"
          error={form.formState.errors.newPassword?.message}
        >
          <InputField type="password" {...form.register("newPassword")} />
        </FormGroup>
        <FormGroup
          label="Confirm new password"
          error={form.formState.errors.confirmPassword?.message}
        >
          <InputField type="password" {...form.register("confirmPassword")} />
        </FormGroup>
      </Card>
    </SettingsSectionCard>
  );
};
