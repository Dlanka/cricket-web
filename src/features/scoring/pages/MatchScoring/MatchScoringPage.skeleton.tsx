import { SkeletonBlock } from "@/shared/components/skeletons/SkeletonBlock";

export const MatchScoringPageSkeleton = () => (
  <div className="mx-auto w-full max-w-6xl space-y-6 px-6">
    <SkeletonBlock className="h-6 w-28" />
    <SkeletonBlock className="h-10 w-80" />
    <SkeletonBlock className="h-32 w-full rounded-3xl" />
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <SkeletonBlock className="h-60 w-full rounded-3xl" />
        <SkeletonBlock className="h-60 w-full rounded-3xl" />
      </div>
      <div className="space-y-6">
        <SkeletonBlock className="h-64 w-full rounded-3xl" />
        <SkeletonBlock className="h-72 w-full rounded-3xl" />
      </div>
    </div>
  </div>
);
