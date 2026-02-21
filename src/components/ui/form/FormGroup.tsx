import { tv } from "tailwind-variants";

type Props = {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

const styles = tv({
  slots: {
    root: "flex flex-col gap-2",
    label: "text-sm font-semibold text-primary-20",
    hint: "text-xs text-neutral-40 pl-1",
    error: "text-xs font-semibold text-error-40 pl-1",
    controller: "flex flex-col w-full gap-1",
  },
});

export const FormGroup = ({ label, hint, error, children }: Props) => {
  const classes = styles();

  return (
    <div className={classes.root()}>
      <label className={classes.label()}>{label}</label>
      <div className={classes.controller()}>
        {children}
        {hint ? <p className={classes.hint()}>{hint}</p> : null}
        {error ? <p className={classes.error()}>{error}</p> : null}
      </div>
    </div>
  );
};
