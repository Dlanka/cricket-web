import { Button } from "@/components/ui/button/Button";

type Props = {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export const WicketToggle = ({ checked, disabled, onChange }: Props) => (
  <Button
    type="button"
    size="sm"
    uppercase
    appearance={checked ? "filled" : "tonal"}
    color="error"
    disabled={disabled}
    aria-pressed={checked}
    onClick={() => onChange(!checked)}
    className={`h-10 w-full justify-center font-display tracking-wider ${
      checked
        ? "border border-error/60 text-on-error shadow-none ring-1 ring-error/45"
        : "border border-error/35 bg-error-container/50 text-on-error-container hover:border-error/55"
    }`}
  >
    Wicket
  </Button>
);
