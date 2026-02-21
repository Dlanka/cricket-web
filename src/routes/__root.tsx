import { createRootRoute } from "@tanstack/react-router";
import { AppLayout } from "../app/layouts/AppLayout";
import { NotFoundPage } from "../features/core/pages/NotFoundPage/NotFoundPage";

export const Route = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFoundPage,
});
