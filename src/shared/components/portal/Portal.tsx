import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
  containerId?: string;
};

export const Portal = ({ children, containerId = "modal-root" }: Props) => {
  const container = document.getElementById(containerId);
  if (!container) return null;
  return createPortal(children, container);
};
