export const LoginIntro = () => (
  <div className="space-y-6">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
      Staff portal
    </p>
    <h1 className="font-display text-4xl font-semibold text-primary-10">
      Welcome back to matchday control.
    </h1>
    <p className="text-lg text-neutral-40">
      Sign in to coordinate staffing, review venue readiness, and sync with
      live scoring pipelines.
    </p>
    <div className="rounded-2xl border border-neutral-90 bg-neutral-98 p-6 text-sm text-neutral-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
      <p className="font-semibold text-primary-10">Demo access</p>
      <p className="mt-2">
        Use any email and password to simulate an authenticated session.
        Authentication is handled by the server and stored in an HttpOnly
        cookie.
      </p>
    </div>
  </div>
);
