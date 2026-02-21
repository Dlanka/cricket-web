export const LandingPageSkeleton = () => (
  <div className="mx-auto w-full max-w-6xl animate-pulse space-y-8 px-6 py-12">
    <div className="h-10 w-3/4 rounded-full bg-neutral-variant-90" />
    <div className="h-6 w-2/3 rounded-full bg-neutral-variant-90" />
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="h-32 rounded-2xl bg-neutral-variant-90" />
      <div className="h-32 rounded-2xl bg-neutral-variant-90" />
      <div className="h-32 rounded-2xl bg-neutral-variant-90" />
    </div>
  </div>
);
