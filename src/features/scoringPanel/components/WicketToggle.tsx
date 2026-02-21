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
    appearance={checked ? "filled" : "outline"}
    color="error"
    disabled={disabled}
    aria-pressed={checked}
    onClick={() => onChange(!checked)}
  >
    Wicket
  </Button>
);
