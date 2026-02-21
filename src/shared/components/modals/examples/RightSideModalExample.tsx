import { RightSideModal } from "../RightSideModal";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { Button } from "@/components/ui/button/Button";

export const RightSideModalExample = () => {
  const { isOpen, open, close } = useDisclosure();

  return (
    <div className="rounded-3xl border border-neutral-90 bg-neutral-99 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
            Modal preview
          </p>
          <h3 className="mt-2 text-xl font-semibold text-primary-10">
            Right side panel
          </h3>
          <p className="mt-2 text-sm text-neutral-40">
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
        <div className="space-y-4 text-sm text-neutral-40">
          <p>
            Replace this content with Team or Player forms inside feature
            folders.
          </p>
          <div className="rounded-2xl border border-neutral-90 bg-neutral-99 p-4">
            Form fields go here.
          </div>
        </div>
      </RightSideModal>
    </div>
  );
};
