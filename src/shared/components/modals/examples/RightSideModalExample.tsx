import { RightSideModal } from "../RightSideModal";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { Button } from "@/components/ui/button/Button";

export const RightSideModalExample = () => {
  const { isOpen, open, close } = useDisclosure();

  return (
    <div className="rounded-3xl border border-outline bg-surface-container p-6 shadow-surface-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
            Modal preview
          </p>
          <h3 className="mt-2 text-xl font-semibold text-on-surface">
            Right side panel
          </h3>
          <p className="mt-2 text-sm text-on-surface-variant">
            Use this panel for create or edit forms.
          </p>
        </div>
        <Button type="button" appearance="filled" color="primary" onClick={open}>
          Open modal
        </Button>
      </div>

      <RightSideModal
        isOpen={isOpen}
        onClose={close}
        title="Create team"
        description="This is a placeholder content area for create and edit forms."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              appearance="outline"
              color="neutral"
              size="sm"
              onClick={close}
            >
              Cancel
            </Button>
            <Button type="button" appearance="filled" color="primary" size="sm">
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-on-surface-variant">
          <p>
            Replace this content with Team or Player forms inside feature
            folders.
          </p>
          <div className="rounded-2xl border border-outline bg-surface-container p-4">
            Form fields go here.
          </div>
        </div>
      </RightSideModal>
    </div>
  );
};


