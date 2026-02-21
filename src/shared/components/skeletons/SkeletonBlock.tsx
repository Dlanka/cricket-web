type SkeletonBlockProps = {
  className?: string;
};

export const SkeletonBlock = ({ className }: SkeletonBlockProps) => (
  <div
    className={`animate-pulse rounded-xl bg-neutral-90/60 ${className ?? "h-6 w-full"}`}
  />
);
