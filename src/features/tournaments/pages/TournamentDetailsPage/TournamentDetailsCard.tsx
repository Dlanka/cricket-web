import { formatDateRange } from "@/shared/utils/date";
import { TournamentHeaderActions } from "../../components/TournamentHeaderActions";
import { BackgroundDecor } from "@/shared/components/layout/BackgroundDecor";
import type {
  TournamentDetails,
  TournamentTiePolicy,
  TournamentType,
} from "@/features/tournaments/types/tournamentTypes";

type Props = {
  tournament: TournamentDetails;
  teamCount?: number;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const typeLabelMap: Record<TournamentType, string> = {
  LEAGUE: "League",
  KNOCKOUT: "Knockout",
  LEAGUE_KNOCKOUT: "League + Knockout",
};
const tiePolicyLabelMap: Record<TournamentTiePolicy, string> = {
  LEAGUE_TIE_SHARED: "League tie: shared points",
  KNOCKOUT_SUPER_OVER_THEN_TIE_BREAK:
    "Knockout tie: Super Over, then manual tie-break if still tied",
};
const humanizeOverviewText = (text: string) =>
  text
    .replaceAll("LEAGUE_KNOCKOUT", "League Knockout")
    .replaceAll("LEAGUE", "League")
    .replaceAll("KNOCKOUT", "Knockout");

type InfoItemProps = {
  label: string;
  value: string | number;
};

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-90 bg-white/60 px-3 py-2 text-sm">
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-40">
      {label}
    </p>
    <p className="text-right font-semibold text-primary-10">{value}</p>
  </div>
);

export const TournamentDetailsCard = ({
  tournament,
  teamCount,
  canEdit,
  onEdit,
  onDelete,
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
      <section className="relative overflow-hidden rounded-3xl border border-neutral-90 backdrop-blur bg-linear-to-r from-info-95 via-secondary-95 to-primary-95 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)]">
        <BackgroundDecor
          imageType="ThrowBall"
          className="absolute -top-10 -left-40 w-80 opacity-15 -rotate-145"
        />
        <BackgroundDecor
          imageType="Ball"
          className="absolute -right-10 -bottom-20 w-70 rotate-15 opacity-15"
        />

        <div className=" overflow-hidden border-b border-neutral-90  px-6 py-5 ">
          <div className="relative z-10 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
              Tournament Overview
            </p>
            {canEdit ? (
              <TournamentHeaderActions onEdit={onEdit} onDelete={onDelete} />
            ) : null}
          </div>
          <h1 className="relative z-10 mt-3 font-display text-3xl font-semibold text-primary-10">
            {tournament.name}
          </h1>
          <p className="relative z-10 mt-2 text-sm text-primary-20">
            {formatValue ? typeLabelMap[formatValue] : "Tournament"}
          </p>
        </div>

        <div className="p-6">
          <p className="text-sm text-neutral-40">
            {formatDateRange(tournament.startDate, tournament.endDate)} at{" "}
            {tournament.location ?? "Location TBD"}
          </p>
          {tournament.description ? (
            <p className="mt-4 text-sm text-neutral-40">
              {tournament.description}
            </p>
          ) : null}
          {overviewDescriptionItems.length > 0 ? (
            <div className="mt-3 rounded-xl border border-neutral-90 bg-neutral-99 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-40">
                Summary
              </p>
              <ul className="mt-2 space-y-1 text-sm text-neutral-50">
                {overviewDescriptionItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neutral-50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-90 bg-neutral-99 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-40">
          Tournament Snapshot
        </p>
        <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          <InfoItem
            label="Format"
            value={formatValue ? typeLabelMap[formatValue] : "TBD"}
          />
          <InfoItem label="Teams" value={teamCount ?? "TBD"} />
          <InfoItem label="Overs / innings" value={oversValue ?? "TBD"} />
          <InfoItem label="Balls / over" value={ballsValue ?? "TBD"} />
          <InfoItem
            label="Status"
            value={overview?.status ?? tournament.status}
          />
          <InfoItem
            label="Venues"
            value={
              tournament.venues?.length
                ? tournament.venues.join(", ")
                : (tournament.location ?? "TBD")
            }
          />
        </div>
      </section>

      {progress || stages ? (
        <section className="rounded-2xl border border-neutral-90 bg-neutral-99 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-40">
            Match Progress
          </p>

          {progress ? (
            <div className="grid gap-y-2 gap-x-6 sm:grid-cols-2">
              <InfoItem
                label="Completed"
                value={`${progress.completedMatches}/${progress.totalMatches}`}
              />
              <InfoItem label="Live" value={progress.liveMatches} />
              <InfoItem label="Scheduled" value={progress.scheduledMatches} />
              <InfoItem label="Total Matches" value={progress.totalMatches} />
            </div>
          ) : null}

          {stages ? (
            <div className="mt-2 grid gap-y-2 gap-x-6 sm:grid-cols-2">
              <InfoItem
                label="League Stage"
                value={`${stages.league.status} (${stages.league.completedMatches}/${stages.league.totalMatches})`}
              />
              <InfoItem
                label="Knockout Stage"
                value={`${stages.knockout.status} (${stages.knockout.completedMatches}/${stages.knockout.totalMatches})`}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {points ? (
        <section className="rounded-2xl border border-neutral-90 bg-neutral-99 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-40">
            Rules
          </p>
          <div className="gap-y-2 grid gap-x-6 sm:grid-cols-2">
            <InfoItem label="Points Win" value={points.win} />
            <InfoItem label="Points Tie" value={points.tie} />
            <InfoItem label="Points No Result" value={points.noResult} />
            <InfoItem label="Points Loss" value={points.loss} />
          </div>
        </section>
      ) : null}

      {tiePolicy ? (
        <p className="text-sm text-neutral-50">
          <span className="font-semibold text-primary-20">Tie policy: </span>
          {tiePolicyLabelMap[tiePolicy]}
        </p>
      ) : null}
    </div>
  );
};
