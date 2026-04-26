import { Link, Outlet, useLocation, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTournament } from "../../features/tournaments/hooks/useTournament";
import { ButtonLink } from "../../components/ui/button/Button";
import { TournamentStatusPill } from "@/features/tournament-ui/components/TournamentStatusPill";
import type { TournamentStatus } from "@/features/tournaments/types/tournamentTypes";

const tabBase =
  "relative rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-on-surface-muted transition hover:text-on-surface";
const tabActive = "bg-primary !text-on-primary";

type TabLinkProps = {
  to:
    | "/tournaments/$tournamentId"
    | "/tournaments/$tournamentId/teams"
    | "/tournaments/$tournamentId/fixtures"
    | "/tournaments/$tournamentId/standings"
    | "/tournaments/$tournamentId/stats"
    | "/tournaments/$tournamentId/awards";
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
  const isScoreContext = location.pathname.endsWith("/score");
  const showStandingsTab =
    tournament?.type === "LEAGUE" ||
    tournament?.type === "LEAGUE_KNOCKOUT" ||
    tournament?.type === "SERIES";
  const statusBadgeClass =
    tournament?.status === "ACTIVE" ||
    tournament?.status === "COMPLETED" ||
    tournament?.status === "DRAFT"
      ? tournament.status
      : null;

  return (
    <div className="theme-tournament min-h-screen max-h-screen overflow-hidden flex flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-outline bg-surface-container backdrop-blur">
        <div className="mx-auto flex h-13 w-full items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center ">
            <ButtonLink
              to="/tournaments"
              appearance="standard"
              color="neutral"
              size="sm"
              className="px-0"
            >
              <span className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span className="block ">Back</span>
              </span>
            </ButtonLink>

            <div className="w-px border-r border-outline h-7 mx-6"></div>
            <div className="mx-auto flex w-full flex-wrap items-center gap-4 ">
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
              {tournament?.status === "COMPLETED" ? (
                <TabLink
                  to="/tournaments/$tournamentId/awards"
                  label="Awards"
                  tournamentId={tournamentId}
                />
              ) : null}
            </div>
          </div>
          {statusBadgeClass ? (
            <TournamentStatusPill
              status={statusBadgeClass as TournamentStatus}
            />
          ) : null}
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        <div
          className={
            isScoreContext
              ? "w-full py-3 pl-3 pr-0 sm:pl-4 sm:pr-0"
              : "mx-auto w-full max-w-6xl px-4 py-6 sm:px-6"
          }
        >
          {isError ? (
            <div className="rounded-2xl border border-error/40 bg-error-container p-6 text-sm text-on-error-container">
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
