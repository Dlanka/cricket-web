type SkeletonBlockProps = {
  className?: string;
};

export const SkeletonBlock = ({ className }: SkeletonBlockProps) => (
  <div
    className={`animate-pulse rounded-xl bg-surface-container-high/60 ${className ?? "h-6 w-full"}`}
  />
);

