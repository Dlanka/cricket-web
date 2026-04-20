import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { classNames } from "@/shared/utils/classNames";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  backButton?: {
    onClick: () => void;
    ariaLabel?: string;
  };
  className?: string;
  contentClassName?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
};

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  backButton,
  className,
  contentClassName,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: PageHeaderProps) => (
  <header
    className={classNames(
      "flex flex-wrap items-start justify-between gap-3",
      className,
    )}
  >
    <div className={classNames("block pr-0", contentClassName)}>
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
          <p
            className={classNames(
              "font-display text-xs font-bold tracking-widest uppercase text-on-surface-muted",
              eyebrowClassName,
            )}
          >
            {eyebrow}
          </p>
        </div>
      </div>
      <h1
        className={classNames(
          "mt-2 font-display text-3xl leading-tight font-bold text-on-surface",
          titleClassName,
        )}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={classNames(
            "mt-2 text-xs text-on-surface-muted",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>

    {actions ? (
      <div className={classNames("flex items-center gap-2", actionsClassName)}>
        {actions}
      </div>
    ) : null}
  </header>
);
