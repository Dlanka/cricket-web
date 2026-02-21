export const SelectTenantPageSkeleton = () => (
  <div className="mx-auto w-full max-w-4xl animate-pulse">
    <div className="space-y-4">
      <div className="h-3 w-28 rounded-full bg-neutral-variant-90" />
      <div className="h-8 w-3/4 rounded-full bg-neutral-variant-90" />
      <div className="h-4 w-1/2 rounded-full bg-neutral-variant-90" />
    </div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="h-24 rounded-2xl bg-neutral-variant-90" />
      <div className="h-24 rounded-2xl bg-neutral-variant-90" />
      <div className="h-24 rounded-2xl bg-neutral-variant-90" />
      <div className="h-24 rounded-2xl bg-neutral-variant-90" />
    </div>
  </div>
);
