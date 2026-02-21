import { Link, useNavigate } from "@tanstack/react-router";
import { Button, ButtonLink } from "./ui/button/Button";
import { useAuth } from "../features/auth/hooks/useAuth";

export const TopNav = () => {
  const { status, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <header className="px-6 pt-8 sm:px-10 lg:px-16">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-90 bg-neutral-98 px-5 py-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
        <Link
          to="/"
          className="flex items-center gap-3 font-display text-xl font-semibold tracking-tight text-primary-10"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-40 text-sm font-bold uppercase text-neutral-98">
            CM
          </span>
          CrickManager
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-40">
          <Link to="/" className="transition hover:text-primary-20">
            Overview
          </Link>
          <Link to="/dashboard" className="transition hover:text-primary-20">
            Command Center
          </Link>
          <Link to="/tournaments" className="transition hover:text-primary-20">
            Tournaments
          </Link>
          <span className="hidden h-4 w-px bg-neutral-90 sm:inline-block" />
          {status === "authed" ? (
            <Button
              type="button"
              appearance="outline"
              color="primary"
              size="sm"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          ) : (
            <ButtonLink to="/login" appearance="filled" color="primary" size="sm">
              Sign in
            </ButtonLink>
          )}
        </nav>
      </div>
    </header>
  );
};
