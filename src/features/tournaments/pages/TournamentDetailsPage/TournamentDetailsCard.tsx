import { formatDateRange } from "@/shared/utils/date";
import { TournamentHeaderActions } from "../../components/TournamentHeaderActions";
import { BackgroundDecor } from "@/shared/components/layout/BackgroundDecor";
import type {
  TournamentDetails,
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

type InfoItemProps = {
  label: string;
  value: string | number;
};

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="rounded-2xl border border-neutral-90 bg-neutral-99 p-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-40">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-primary-10">{value}</p>
  </div>
);

export const TournamentDetailsCard = ({
  tournament,
  teamCount,
  canEdit,
  onEdit,
  onDelete,
}: Props) => (
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
          {tournament.type ? typeLabelMap[tournament.type] : "Tournament"}
        </p>
      </div>

      <div className="p-6">
        <p className="text-sm text-neutral-40">
          {formatDateRange(tournament.startDate, tournament.endDate)} at{" "}
          {tournament.location ?? "Location TBD"}
        </p>
        <p className="mt-4 text-sm text-neutral-40">
          {tournament.description ?? "No description provided yet."}
        </p>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <InfoItem
        label="Format"
        value={tournament.type ? typeLabelMap[tournament.type] : "TBD"}
      />
      <InfoItem label="Teams" value={teamCount ?? "TBD"} />
      <InfoItem
        label="Overs / innings"
        value={tournament.oversPerInnings ?? "TBD"}
      />
      <InfoItem label="Balls / over" value={tournament.ballsPerOver ?? "TBD"} />
    </section>

    <InfoItem
      label="Venues"
      value={
        tournament.venues?.length
          ? tournament.venues.join(", ")
          : (tournament.location ?? "TBD")
      }
    />
  </div>
);
