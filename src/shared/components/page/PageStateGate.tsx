import { useEffect, type ReactNode } from "react";
import { classNames } from "@/shared/utils/classNames";

type PageStateGateProps = {
  isLoading: boolean;
  loadingFallback: ReactNode;
  isUnauthorized?: boolean;
  errorMessage?: string | null;
  isNotFound?: boolean;
  notFoundMessage?: string;
  alertClassName?: string;
  onUnauthorized?: () => void;
  children: ReactNode;
};

const DEFAULT_ALERT_CLASSNAME =
  "rounded-2xl border border-error/25 bg-error-container p-6 text-sm text-on-error-container";

export const PageStateGate = ({
  isLoading,
  loadingFallback,
  isUnauthorized = false,
  errorMessage,
  isNotFound = false,
  notFoundMessage = "Not found.",
  alertClassName,
  onUnauthorized,
  children,
}: PageStateGateProps) => {
  useEffect(() => {
    if (!isUnauthorized) return;
    if (onUnauthorized) {
      onUnauthorized();
      return;
    }
    window.location.assign("/login");
  }, [isUnauthorized, onUnauthorized]);

  if (isUnauthorized) {
    return null;
  }

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (errorMessage) {
    return (
      <div className={classNames(DEFAULT_ALERT_CLASSNAME, alertClassName)}>
        {errorMessage}
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className={classNames(DEFAULT_ALERT_CLASSNAME, alertClassName)}>
        {notFoundMessage}
      </div>
    );
  }

  return <>{children}</>;
};


