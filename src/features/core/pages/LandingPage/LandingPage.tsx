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
        <div className="flex items-center gap-3 text-on-surface">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-bold uppercase text-on-primary">
            CM
          </span>
          <div>
            <p className="text-sm font-semibold">CrickManager</p>
            <p className="text-xs text-on-surface-variant">Operations Suite</p>
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

      <section className="grid gap-10 lg:layout-split-auth lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
            Public landing
          </p>
          <h1 className="font-display text-4xl font-semibold text-on-surface sm:text-5xl">
            CrickManager keeps cricket operations calm, coordinated, and ready.
          </h1>
          <p className="text-lg text-on-surface-variant">
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
          <div className="flex flex-wrap gap-6 text-sm text-on-surface-variant">
            <div>
              <p className="text-xl font-semibold text-on-surface">32</p>
              <p>Active venues</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-on-surface">140+</p>
              <p>Live fixtures</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-on-surface">99.2%</p>
              <p>Broadcast uptime</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-outline bg-surface-container p-8 shadow-surface-lg backdrop-blur">
          <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-primary-container opacity-60 blur-glow" />
          <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-secondary-soft opacity-60 blur-glow" />
          <div className="relative space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Matchday board
            </p>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-outline bg-surface px-5 py-4">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                  Next fixture
                </p>
                <p className="mt-2 text-lg font-semibold text-on-surface">
                  Alpha CC vs Bravo CC
                </p>
                <p className="text-sm text-on-surface-variant">4:30 PM · East Oval</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-outline bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                    Staff ready
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-on-surface">
                    18/20
                  </p>
                </div>
                <div className="rounded-2xl border border-outline bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                    Weather check
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-on-surface">
                    Clear
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-outline bg-surface px-4 py-4 text-sm text-on-surface-variant">
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
            className="rounded-2xl border border-outline bg-surface-container p-6 text-on-surface shadow-surface-lg backdrop-blur"
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-outline bg-surface-container p-8 shadow-surface-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Sponsored
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-on-surface">
              Trusted partners for matchday operations
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
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
              className="flex flex-col justify-between rounded-2xl border border-outline bg-surface p-5 text-on-surface"
            >
              <p className="text-sm font-semibold">{brand}</p>
              <p className="mt-2 text-xs text-on-surface-variant">
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




