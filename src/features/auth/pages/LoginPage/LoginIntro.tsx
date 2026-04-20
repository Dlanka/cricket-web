export const LoginIntro = () => (
  <div className="space-y-6">
    <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
      Staff portal
    </p>
    <h1 className="font-display text-4xl font-semibold text-on-surface">
      Welcome back to matchday control.
    </h1>
    <p className="text-lg text-on-surface-variant">
      Sign in to coordinate staffing, review venue readiness, and sync with
      live scoring pipelines.
    </p>
    <div className="rounded-2xl border border-outline bg-surface p-6 text-sm text-on-surface-variant shadow-surface-lg backdrop-blur">
      <p className="font-semibold text-on-surface">Demo access</p>
      <p className="mt-2">
        Use any email and password to simulate an authenticated session.
        Authentication is handled by the server and stored in an HttpOnly
        cookie.
      </p>
    </div>
  </div>
);


