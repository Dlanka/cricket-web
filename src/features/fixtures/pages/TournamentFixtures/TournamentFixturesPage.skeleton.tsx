export const TournamentFixturesPageSkeleton = () => (
  <div className="mx-auto w-full space-y-12">
    <div className="h-6 w-32 rounded-full bg-surface-container-high" />
    <div className="h-9 w-72 rounded-2xl bg-surface-container-high" />
    <div className="h-10 w-44 rounded-2xl bg-surface-container-high" />
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={`fixture-stage-${index}`} className="space-y-3">
          <div className="h-5 w-24 rounded-full bg-surface-container-high" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((__, matchIndex) => (
              <div
                key={`fixture-card-${index}-${matchIndex}`}
                className="h-16 rounded-2xl border border-outline-variant bg-surface-container"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);


