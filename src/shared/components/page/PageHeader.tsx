import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button/Button";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  backButton?: {
    onClick: () => void;
    ariaLabel?: string;
  };
};

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  backButton,
}: PageHeaderProps) => (
  <header className="flex justify-between items-center">
    <div className="block pr-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {backButton ? (
            <Button
              type="button"
              appearance="standard"
              color="neutral"
              size="sm"
              className="-ml-4"
              onClick={backButton.onClick}
              aria-label={backButton.ariaLabel ?? "Go back"}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
            {eyebrow}
          </p>
        </div>
      </div>
      <h1 className="mt-2 text-3xl font-semibold text-primary-10">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-neutral-40">{description}</p>
      ) : null}
    </div>

    <div className="flex items-center gap-3">{actions}</div>
  </header>
);
