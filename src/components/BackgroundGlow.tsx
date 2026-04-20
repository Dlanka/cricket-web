export const BackgroundGlow = () => {
  return (
    <div className="pointer-events-none absolute inset-0 max-h-screen overflow-hidden">
      <div className="absolute -left-24 -top-40 h-112 w-112 rounded-full bg-secondary-soft blur-glow" />
      <div className="absolute -right-48 top-24 h-128 w-128 rounded-full bg-secondary-container blur-glow-lg" />
      <div className="absolute -bottom-48 left-1/3 h-104 w-104 rounded-full bg-warning-soft blur-glow" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-neutral-80 to-transparent" />
    </div>
  );
};



