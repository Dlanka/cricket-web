import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { Button } from "@/components/ui/button/Button";
import { useSignupMutation } from "@/features/auth/hooks/useSignupMutation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLoginSessionStore } from "@/features/auth/store/loginSessionStore";
import {
  signupSchema,
  type SignupFormValues,
} from "@/features/auth/schemas/signupSchema";
import { normalizeApiError } from "@/shared/utils/apiErrors";

type Props = {
  onSuccess: () => void;
};

export const SignupForm = ({ onSuccess }: Props) => {
  const { refreshMe } = useAuth();
  const mutation = useSignupMutation();
  const clearSession = useLoginSessionStore((state) => state.clearSession);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await mutation.mutateAsync(values);
      clearSession();
      await refreshMe();
      onSuccess();
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "auth.email_already_exists") {
        toast.error("This email is already in use. Try signing in.");
        return;
      }
      toast.error(normalized.message || "Unable to create account.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-neutral-90 bg-neutral-99 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] backdrop-blur"
    >
      <div className="space-y-5">
        <FormGroup label="Full name" error={errors.fullName?.message}>
          <InputField
            type="text"
            placeholder="Acme Owner"
            {...register("fullName")}
          />
        </FormGroup>
        <FormGroup label="Email address" error={errors.email?.message}>
          <InputField
            type="email"
            placeholder="owner@acme.com"
            {...register("email")}
          />
        </FormGroup>
        <FormGroup label="Password" error={errors.password?.message}>
          <InputField
            type="password"
            placeholder="Use at least 8 characters"
            {...register("password")}
          />
        </FormGroup>
        <FormGroup
          label="Organization name"
          error={errors.tenantName?.message}
        >
          <InputField
            type="text"
            placeholder="Acme Cricket"
            {...register("tenantName")}
          />
        </FormGroup>
        <Button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          appearance="filled"
          color="primary"
          size="full"
        >
          {mutation.isPending ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-center text-sm text-neutral-40">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-20 underline">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};
