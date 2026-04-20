export const SignupIntro = () => (
  <div className="space-y-6">
    <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
      Organization setup
    </p>
    <h1 className="font-display text-4xl font-semibold text-on-surface">
      Create your tenant and owner account.
    </h1>
    <p className="text-lg text-on-surface-variant">
      Sign up once to create your tenant, assign owner access, and start
      managing tournaments immediately.
    </p>
    <div className="rounded-2xl border border-outline bg-surface p-6 text-sm text-on-surface-variant shadow-surface-lg backdrop-blur">
      <p className="font-semibold text-on-surface">What happens on signup</p>
      <p className="mt-2">
        A new user, tenant, and owner/admin membership are created in a single
        step with an authenticated session.
      </p>
    </div>
  </div>
);


