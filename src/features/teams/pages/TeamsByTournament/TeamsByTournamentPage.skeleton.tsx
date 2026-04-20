export const TeamsByTournamentPageSkeleton = () => (
  <div className="mx-auto w-full animate-pulse space-y-12 py-8">
    <div className="h-10 w-2/3 rounded-full bg-surface-container-high" />
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="h-20 rounded-2xl bg-surface-container-high" />
        <div className="h-20 rounded-2xl bg-surface-container-high" />
        <div className="h-20 rounded-2xl bg-surface-container-high" />
      </div>
      <div className="h-80 rounded-3xl bg-surface-container-high" />
    </div>
  </div>
);

