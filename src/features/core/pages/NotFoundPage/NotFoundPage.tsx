import { ButtonLink } from "@/components/ui/button/Button";

export const NotFoundPage = () => (
  <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-6 text-center">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
      404
    </p>
    <h1 className="font-display text-4xl font-semibold text-primary-10">
      This page is outside the boundary rope.
    </h1>
    <p className="text-base text-neutral-40">
      Return to the command center to keep match operations on track.
    </p>
    <ButtonLink to="/" appearance="filled" color="primary" size="lg">
      Back to overview
    </ButtonLink>
  </div>
);
