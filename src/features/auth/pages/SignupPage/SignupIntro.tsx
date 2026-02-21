export const SignupIntro = () => (
  <div className="space-y-6">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
      Organization setup
    </p>
    <h1 className="font-display text-4xl font-semibold text-primary-10">
      Create your tenant and owner account.
    </h1>
    <p className="text-lg text-neutral-40">
      Sign up once to create your tenant, assign owner access, and start
      managing tournaments immediately.
    </p>
    <div className="rounded-2xl border border-neutral-90 bg-neutral-98 p-6 text-sm text-neutral-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
      <p className="font-semibold text-primary-10">What happens on signup</p>
      <p className="mt-2">
        A new user, tenant, and owner/admin membership are created in a single
        step with an authenticated session.
      </p>
    </div>
  </div>
);
