export const TeamsByTournamentPageSkeleton = () => (
  <div className="mx-auto w-full max-w-5xl animate-pulse space-y-6 px-6 py-8">
    <div className="h-10 w-2/3 rounded-full bg-neutral-variant-90" />
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="space-y-4">
        <div className="h-20 rounded-2xl bg-neutral-variant-90" />
        <div className="h-20 rounded-2xl bg-neutral-variant-90" />
        <div className="h-20 rounded-2xl bg-neutral-variant-90" />
      </div>
      <div className="h-80 rounded-3xl bg-neutral-variant-90" />
    </div>
  </div>
);
