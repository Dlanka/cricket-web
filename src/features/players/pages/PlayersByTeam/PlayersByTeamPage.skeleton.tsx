export const PlayersByTeamPageSkeleton = () => (
  <div className="mx-auto w-full max-w-5xl space-y-6 px-6">
    <div className="h-6 w-32 rounded-full bg-neutral-95" />
    <div className="h-9 w-72 rounded-2xl bg-neutral-95" />
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`player-skeleton-${index}`}
            className="h-20 rounded-2xl border border-neutral-95 bg-neutral-99"
          />
        ))}
      </div>
      <div className="h-72 rounded-3xl border border-neutral-95 bg-neutral-99" />
    </div>
  </div>
);
