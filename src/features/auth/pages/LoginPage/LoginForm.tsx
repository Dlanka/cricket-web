import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useLoginMutation } from "../../hooks/useLoginMutation";
import { loginSchema, type LoginFormValues } from "../../schemas/loginSchema";
import { useAuth } from "../../hooks/useAuth";
import { useLoginSessionStore } from "../../store/loginSessionStore";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { Button } from "@/components/ui/button/Button";

type Props = {
  onLoggedIn: () => void;
  onSelectTenant: () => void;
};

export const LoginForm = ({ onLoggedIn, onSelectTenant }: Props) => {
  const { refreshMe } = useAuth();
  const { setSession, clearSession } = useLoginSessionStore((state) => state);
  const mutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const payload = await mutation.mutateAsync(values);
      if (payload.mode === "LOGGED_IN") {
        clearSession();
        await refreshMe();
        onLoggedIn();
        return;
      }
      setSession(
        payload.loginSessionToken,
        payload.tenants.map((tenant) => ({
          id: tenant.tenantId,
          name: tenant.tenantName,
          role: tenant.role,
        })),
      );
      onSelectTenant();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-outline bg-surface-container p-8 shadow-surface-lg backdrop-blur"
    >
      <div className="space-y-5">
        <FormGroup label="Email address" error={errors.email?.message}>
          <input
            type="email"
            placeholder="operations@club.org"
            className="w-full rounded-xl border border-outline bg-surface-container px-4 py-3 text-sm text-on-surface shadow-sm focus:border-outline-strong focus:outline-none"
            {...register("email")}
          />
        </FormGroup>
        <FormGroup label="Password" error={errors.password?.message}>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-outline bg-surface-container px-4 py-3 text-sm text-on-surface shadow-sm focus:border-outline-strong focus:outline-none"
            {...register("password")}
          />
        </FormGroup>
        <Button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          appearance="filled"
          color="primary"
          size="full"
        >
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-sm text-on-surface-variant">
          New organization?{" "}
          <Link to="/signup" className="font-semibold text-on-primary-container underline">
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
};

