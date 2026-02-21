export const MatchRosterPageSkeleton = () => (
  <div className="mx-auto w-full max-w-6xl space-y-6 px-6">
    <div className="h-6 w-32 rounded-full bg-neutral-95" />
    <div className="h-9 w-72 rounded-2xl bg-neutral-95" />
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={`roster-panel-${index}`} className="space-y-4">
          <div className="h-6 w-40 rounded-full bg-neutral-95" />
          <div className="h-72 rounded-3xl border border-neutral-95 bg-neutral-99" />
        </div>
      ))}
    </div>
  </div>
);
