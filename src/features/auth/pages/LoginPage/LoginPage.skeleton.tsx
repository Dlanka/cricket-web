export const LoginPageSkeleton = () => (
  <div className="mx-auto w-full max-w-5xl animate-pulse">
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="h-3 w-32 rounded-full bg-neutral-variant-90" />
        <div className="h-10 w-3/4 rounded-full bg-neutral-variant-90" />
        <div className="h-4 w-2/3 rounded-full bg-neutral-variant-90" />
        <div className="h-28 w-full rounded-2xl bg-neutral-variant-90" />
      </div>
      <div className="h-80 rounded-3xl bg-neutral-variant-90" />
    </div>
  </div>
);
