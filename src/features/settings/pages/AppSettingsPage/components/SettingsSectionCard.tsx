import type { ReactNode } from "react";
import { Button } from "@/components/ui/button/Button";
import { Card } from "@/shared/components/card/Card";

type SettingsSectionCardProps = {
  title: string;
  canSave: boolean;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
  actions?: ReactNode;
  children: ReactNode;
};

export const SettingsSectionCard = ({
  title,
  canSave,
  isSaving,
  isDirty,
  onSave,
  actions,
  children,
}: SettingsSectionCardProps) => (
  <Card className="space-y-4 p-4">
    <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-20">
      {title}
    </h2>
    {children}
    {canSave || actions ? (
      <div className="flex items-center justify-end gap-2">
        {actions}
        {canSave ? (
        <Button
          type="button"
          size="sm"
          disabled={!isDirty || isSaving}
          onClick={onSave}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
        ) : null}
      </div>
    ) : null}
  </Card>
);
