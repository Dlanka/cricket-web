import { Link, Outlet, useLocation, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTournament } from "../../features/tournaments/hooks/useTournament";
import { ButtonLink } from "../../components/ui/button/Button";

const tabBase =
  "relative rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-90 transition";
const tabActive = "bg-neutral-90 !text-neutral-20 ";
// const tabActive = "bg-secondary-50 !text-secondary-20 ";

type TabLinkProps = {
  to:
    | "/tournaments/$tournamentId"
    | "/tournaments/$tournamentId/teams"
    | "/tournaments/$tournamentId/fixtures"
    | "/tournaments/$tournamentId/standings"
    | "/tournaments/$tournamentId/stats";
  label: string;
  tournamentId: string;
  exact?: boolean;
  forceActive?: boolean;
};

const TabLink = ({
  to,
  label,
  tournamentId,
  exact,
  forceActive,
}: TabLinkProps) => (
  <Link
    to={to}
    params={{ tournamentId }}
    className={forceActive ? `${tabBase} ${tabActive}` : tabBase}
    activeProps={{ className: `${tabBase} ${tabActive}` }}
    activeOptions={exact ? { exact: true } : undefined}
  >
    {label}
  </Link>
);

export const TournamentLayout = () => {
  const { tournamentId } = useParams({ from: "/tournaments/$tournamentId" });
  const location = useLocation();
  const { data: tournament, isError } = useTournament(tournamentId);
  const isFixturesContext = location.pathname.startsWith(
    `/tournaments/${tournamentId}/matches/`,
  );
  const showStandingsTab =
    tournament?.type === "LEAGUE" || tournament?.type === "LEAGUE_KNOCKOUT";
  const statusBadgeClass =
    tournament?.status === "ACTIVE"
      ? "border-success-70 bg-success-95 text-success-30"
      : tournament?.status === "COMPLETED"
        ? "border-error-70 bg-error-95 text-error-30"
        : "border-warning-70 bg-warning-95 text-warning-30";

  return (
    <div className="min-h-screen max-h-screen overflow-hidden flex flex-col">
      <header className="sticky top-0 z-20  bg-primary-40 backdrop-blur ">
        <div className="mx-auto flex h-13 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <ButtonLink
              to="/tournaments"
              appearance="standard"
              color="neutral"
              size="sm"
            >
              <span className="text-neutral-90 inline-flex items-center gap-3">
                <ArrowLeft className="h-4 w-4" />
              </span>
            </ButtonLink>

            <div className="mx-auto flex w-full flex-wrap items-center gap-4 px-4 sm:px-6">
              <TabLink
                to="/tournaments/$tournamentId"
                label="Overview"
                tournamentId={tournamentId}
                exact
              />
              <TabLink
                to="/tournaments/$tournamentId/teams"
                label="Teams"
                tournamentId={tournamentId}
              />
              <TabLink
                to="/tournaments/$tournamentId/fixtures"
                label="Fixtures"
                tournamentId={tournamentId}
                forceActive={isFixturesContext}
              />
              {showStandingsTab ? (
                <TabLink
                  to="/tournaments/$tournamentId/standings"
                  label="Standings"
                  tournamentId={tournamentId}
                />
              ) : null}
              <TabLink
                to="/tournaments/$tournamentId/stats"
                label="Stats"
                tournamentId={tournamentId}
              />
            </div>
          </div>
          {tournament?.status ? (
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}
            >
              {tournament.status}
            </span>
          ) : null}
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          {isError ? (
            <div className="rounded-2xl border border-error-80 bg-error-95 p-6 text-sm text-error-40">
              Tournament not found.{" "}
              <Link to="/tournaments" className="font-semibold underline">
                Back to tournaments
              </Link>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};
