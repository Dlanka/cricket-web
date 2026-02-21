import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const ForbiddenPage = () => (
  <div className="mx-auto w-full max-w-3xl px-6 py-8">
    <EmptyState
      title="Access denied"
      description="You do not have permission to access this page."
    />
  </div>
);
