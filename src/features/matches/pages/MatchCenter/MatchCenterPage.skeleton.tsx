import { SkeletonBlock } from "@/shared/components/skeletons/SkeletonBlock";

export const MatchCenterPageSkeleton = () => (
  <div className="mx-auto w-full max-w-5xl space-y-6 px-6">
    <SkeletonBlock className="h-8 w-48 rounded-full" />
    <SkeletonBlock className="h-28 w-full rounded-3xl" />
    <SkeletonBlock className="h-56 w-full rounded-3xl" />
  </div>
);
