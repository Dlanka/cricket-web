import { ButtonLink } from "@/components/ui/button/Button";
import { RightSideModalExample } from "@/shared/components/modals/examples/RightSideModalExample";

const highlights = [
  {
    title: "Matchday command",
    description:
      "Run scheduling, staffing, and venue readiness from a single live board.",
  },
  {
    title: "Tenant-ready",
    description:
      "Keep clubs, leagues, and regions isolated while sharing standards.",
  },
  {
    title: "Reliable operations",
    description:
      "Track availability, fixtures, and broadcasts with clear accountability.",
  },
];

export const LandingPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-primary-10">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-40 text-sm font-bold uppercase text-neutral-98">
            CM
          </span>
          <div>
            <p className="text-sm font-semibold">CrickManager</p>
            <p className="text-xs text-neutral-40">Operations Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ButtonLink to="/login" appearance="outline" color="primary" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink to="/login" appearance="filled" color="primary" size="sm">
            Get started
          </ButtonLink>
        </div>
      </header>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
            Public landing
          </p>
          <h1 className="font-display text-4xl font-semibold text-primary-10 sm:text-5xl">
            CrickManager keeps cricket operations calm, coordinated, and ready.
          </h1>
          <p className="text-lg text-neutral-40">
            Unify fixtures, staffing, and venue readiness across your tenant.
            When matchday arrives, everyone sees the same live plan.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/login" appearance="filled" color="primary" size="lg">
              Sign in
            </ButtonLink>
            <ButtonLink to="/tournaments" appearance="outline" color="primary" size="lg">
              View tournaments
            </ButtonLink>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-neutral-40">
            <div>
              <p className="text-xl font-semibold text-primary-10">32</p>
              <p>Active venues</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-primary-10">140+</p>
              <p>Live fixtures</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-primary-10">99.2%</p>
              <p>Broadcast uptime</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-neutral-90 bg-neutral-99 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-primary-90 opacity-60 blur-glow" />
          <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-secondary-90 opacity-60 blur-glow" />
          <div className="relative space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
              Matchday board
            </p>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-neutral-90 bg-neutral-98 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-40">
                  Next fixture
                </p>
                <p className="mt-2 text-lg font-semibold text-primary-10">
                  Alpha CC vs Bravo CC
                </p>
                <p className="text-sm text-neutral-40">4:30 PM · East Oval</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-90 bg-neutral-98 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-40">
                    Staff ready
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-primary-10">
                    18/20
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-90 bg-neutral-98 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-40">
                    Weather check
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-primary-10">
                    Clear
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-90 bg-neutral-98 px-4 py-4 text-sm text-neutral-40">
                All production, officials, and transport tasks confirmed.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-neutral-90 bg-neutral-99 p-6 text-primary-10 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur"
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-neutral-40">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-neutral-90 bg-neutral-99 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
              Sponsored
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-primary-10">
              Trusted partners for matchday operations
            </h2>
            <p className="mt-2 text-sm text-neutral-40">
              Ads and promotions from partners that support clubs, leagues, and venues.
            </p>
          </div>
          <ButtonLink to="/login" appearance="outline" color="primary" size="md">
            Advertise with us
          </ButtonLink>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["Nimbus Broadcast", "PitchPro Turf", "Stumps Analytics"].map((brand) => (
            <div
              key={brand}
              className="flex flex-col justify-between rounded-2xl border border-neutral-90 bg-neutral-98 p-5 text-primary-10"
            >
              <p className="text-sm font-semibold">{brand}</p>
              <p className="mt-2 text-xs text-neutral-40">
                Upgrade your operations with tools built for cricket matchdays.
              </p>
              <ButtonLink
                to="/login"
                appearance="standard"
                color="primary"
                size="sm"
                className="mt-3 self-start"
              >
                Learn more
              </ButtonLink>
            </div>
          ))}
        </div>
      </section>

      <section>
        <RightSideModalExample />
      </section>
    </div>
  );
};
