import { SkeletonBlock } from "@/shared/components/skeletons/SkeletonBlock";

export const MatchStartPageSkeleton = () => (
  <div className="mx-auto w-full max-w-4xl space-y-6 px-6">
    <SkeletonBlock className="h-6 w-32" />
    <SkeletonBlock className="h-10 w-72" />
    <SkeletonBlock className="h-5 w-full" />
    <SkeletonBlock className="h-64 w-full" />
  </div>
);
