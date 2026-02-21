import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Portal } from "../portal/Portal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
};

export const RightSideModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  widthClassName = "w-full sm:w-[420px] md:w-[480px]",
  closeOnOverlayClick = true,
  showCloseButton = true,
}: Props) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-50">
            <motion.div
              className="absolute inset-0 bg-neutral-40/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOnOverlayClick ? onClose : undefined}
            />
            <motion.div
              className={`absolute right-0 top-0 h-full bg-neutral-99 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.6)] ${widthClassName}`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              ref={panelRef}
            >
              <div className="flex h-full flex-col">
                {(title || showCloseButton) && (
                  <div className="flex items-start justify-between gap-4 border-b border-neutral-90 px-6 py-5">
                    <div>
                      {title && (
                        <h2 className="text-lg font-semibold text-primary-10">
                          {title}
                        </h2>
                      )}
                      {description && (
                        <p className="mt-1 text-sm text-neutral-40">
                          {description}
                        </p>
                      )}
                    </div>
                    {showCloseButton ? (
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-90 text-neutral-40 transition hover:border-neutral-80 hover:text-neutral-30"
                        onClick={onClose}
                        aria-label="Close"
                        title="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {children}
                </div>
                {footer ? (
                  <div className="border-t border-neutral-90 px-6 py-4">
                    {footer}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
};
