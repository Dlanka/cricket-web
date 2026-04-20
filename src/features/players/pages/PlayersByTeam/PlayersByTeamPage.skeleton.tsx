export const PlayersByTeamPageSkeleton = () => (
  <div className="mx-auto w-full space-y-12">
    <div className="h-6 w-32 rounded-full bg-surface-container-high" />
    <div className="h-9 w-72 rounded-2xl bg-surface-container-high" />
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`player-skeleton-${index}`}
            className="h-20 rounded-2xl border border-outline-variant bg-surface-container"
          />
        ))}
      </div>
      <div className="h-72 rounded-3xl border border-outline-variant bg-surface-container" />
    </div>
  </div>
);

