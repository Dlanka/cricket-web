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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline bg-surface px-5 py-4 shadow-surface-lg backdrop-blur">
        <Link
          to="/"
          className="flex items-center gap-3 font-display text-xl font-semibold tracking-tight text-on-surface"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-bold uppercase text-on-primary">
            CM
          </span>
          CrickManager
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-on-surface-variant">
          <Link to="/" className="transition hover:text-on-primary-container">
            Overview
          </Link>
          <Link to="/dashboard" className="transition hover:text-on-primary-container">
            Command Center
          </Link>
          <Link to="/tournaments" className="transition hover:text-on-primary-container">
            Tournaments
          </Link>
          <span className="hidden h-4 w-px bg-surface-container-high sm:inline-block" />
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


