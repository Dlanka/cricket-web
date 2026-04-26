import { formatDateRange } from "@/shared/utils/date";
import { TournamentCard } from "@/features/tournament-ui/components/TournamentCard";
import { TournamentStatTile } from "@/features/tournament-ui/components/TournamentStatTile";
import type {
  TournamentDetails,
  TournamentTiePolicy,
  TournamentType,
} from "@/features/tournaments/types/tournamentTypes";

type Props = {
  tournament: TournamentDetails;
  teamCount?: number;
};

const typeLabelMap: Record<TournamentType, string> = {
  LEAGUE: "League",
  KNOCKOUT: "Knockout",
  LEAGUE_KNOCKOUT: "League + Knockout",
  SERIES: "Series (Best of)",
};
const tiePolicyLabelMap: Record<TournamentTiePolicy, string> = {
  LEAGUE_TIE_SHARED: "League tie: shared points",
  KNOCKOUT_SUPER_OVER_THEN_TIE_BREAK:
    "Knockout tie: Super Over, then manual tie-break if still tied",
};
const humanizeOverviewText = (text: string) =>
  text
    .replaceAll("LEAGUE_KNOCKOUT", "League Knockout")
    .replaceAll("SERIES", "Series")
    .replaceAll("LEAGUE", "League")
    .replaceAll("KNOCKOUT", "Knockout");

export const TournamentDetailsCard = ({
  tournament,
  teamCount,
}: Props) => {
  const overview = tournament.overview;
  const formatValue = overview?.type ?? tournament.type;
  const oversValue =
    overview?.settings.oversPerInnings ?? tournament.oversPerInnings;
  const ballsValue = overview?.settings.ballsPerOver ?? tournament.ballsPerOver;
  const progress = overview?.progress;
  const stages = overview?.stages;
  const points = overview?.rules.points;
  const tiePolicy = overview?.tiePolicy;
  const overviewDescriptionItems = (tournament.overviewDescription ?? "")
    .split(". ")
    .map((part) => humanizeOverviewText(part.trim()))
    .filter(Boolean)
    .map((part) => (part.endsWith(".") ? part : `${part}.`));

  return (
    <div className="space-y-4">
      <TournamentCard>
        <p className="text-sm text-on-surface-variant">
          {formatDateRange(tournament.startDate, tournament.endDate)} at{" "}
          {tournament.location ?? "Location TBD"}
        </p>
        {tournament.description ? (
          <p className="mt-4 text-sm text-on-surface-variant">
            {tournament.description}
          </p>
        ) : null}
        {overviewDescriptionItems.length > 0 ? (
          <div className="mt-3 rounded-xl border border-outline bg-surface-container-high p-3">
            <p className="font-display text-xs font-bold tracking-widest uppercase text-on-surface-variant">
              Summary
            </p>
            <ul className="mt-3 grid gap-2">
              {overviewDescriptionItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-on-surface-variant"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </TournamentCard>

      <TournamentCard
        muted
        header={
          <p className="font-display text-xs font-bold tracking-widest uppercase text-on-surface-muted">
            Tournament snapshot
          </p>
        }
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <TournamentStatTile
            label="Format"
            value={formatValue ? typeLabelMap[formatValue] : "TBD"}
          />
          <TournamentStatTile label="Teams" value={teamCount ?? "TBD"} />
          <TournamentStatTile
            label="Overs / innings"
            value={oversValue ?? "TBD"}
          />
          <TournamentStatTile
            label="Balls / over"
            value={ballsValue ?? "TBD"}
          />
          <TournamentStatTile
            label="Status"
            value={overview?.status ?? tournament.status}
          />
          <TournamentStatTile
            label="Venues"
            value={
              tournament.venues?.length
                ? tournament.venues.join(", ")
                : (tournament.location ?? "TBD")
            }
          />
        </div>
      </TournamentCard>

      {progress || stages ? (
        <TournamentCard
          muted
          header={
            <p className="font-display text-xs font-bold tracking-widest uppercase text-on-surface-muted">
              Match progress
            </p>
          }
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {progress ? (
              <>
                <TournamentStatTile
                  label="Completed"
                  value={`${progress.completedMatches}/${progress.totalMatches}`}
                />
                <TournamentStatTile label="Live" value={progress.liveMatches} />
                <TournamentStatTile
                  label="Scheduled"
                  value={progress.scheduledMatches}
                />
                <TournamentStatTile
                  label="Total matches"
                  value={progress.totalMatches}
                />
              </>
            ) : null}
            {stages ? (
              <>
                <TournamentStatTile
                  label="League stage"
                  value={`${stages.league.status} (${stages.league.completedMatches}/${stages.league.totalMatches})`}
                />
                <TournamentStatTile
                  label="Knockout stage"
                  value={`${stages.knockout.status} (${stages.knockout.completedMatches}/${stages.knockout.totalMatches})`}
                />
              </>
            ) : null}
          </div>
        </TournamentCard>
      ) : null}

      {points ? (
        <TournamentCard
          muted
          header={
            <p className="font-display text-xs font-bold tracking-widest uppercase text-on-surface-muted">
              Rules
            </p>
          }
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <TournamentStatTile label="Points win" value={points.win} mono />
            <TournamentStatTile label="Points tie" value={points.tie} mono />
            <TournamentStatTile
              label="Points no result"
              value={points.noResult}
              mono
            />
            <TournamentStatTile label="Points loss" value={points.loss} mono />
          </div>
        </TournamentCard>
      ) : null}

      {tiePolicy ? (
        <TournamentCard muted>
          <p className="text-sm text-on-surface-variant">
            <span className="font-semibold text-primary">Tie policy: </span>
            {tiePolicyLabelMap[tiePolicy]}
          </p>
        </TournamentCard>
      ) : null}
    </div>
  );
};
