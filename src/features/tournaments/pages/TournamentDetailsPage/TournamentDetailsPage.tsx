import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTournament } from "../../hooks/useTournament";
import { TournamentDetailsCard } from "./TournamentDetailsCard";
import { TournamentDetailsPageSkeleton } from "./TournamentDetailsPage.skeleton";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { TournamentEditModal } from "../../components/TournamentEditModal";
import { TournamentDeleteModal } from "../../components/TournamentDeleteModal";
import { useTeamsByTournamentQuery } from "@/features/teams/hooks/useTeamsByTournamentQuery";
import { useDeleteTournamentMutation } from "../../hooks/useDeleteTournamentMutation";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { TournamentStatusPill } from "@/features/tournament-ui/components/TournamentStatusPill";
import { TournamentHeaderActions } from "../../components/TournamentHeaderActions";
import type { TournamentType } from "../../types/tournamentTypes";
import { useTournamentPlayerOfSeriesQuery } from "../../hooks/useTournamentPlayerOfSeriesQuery";
import { useTournamentMatchesQuery } from "@/features/fixtures/hooks/useTournamentMatchesQuery";

const typeLabelMap: Record<TournamentType, string> = {
  LEAGUE: "League",
  KNOCKOUT: "Knockout",
  LEAGUE_KNOCKOUT: "League + Knockout",
  SERIES: "Series (Best of)",
};

const formatDeleteSummary = (
  deleted?: {
    teams?: number;
    players?: number;
    matches?: number;
    matchPlayers?: number;
    innings?: number;
    inningsBatters?: number;
    inningsBowlers?: number;
    scoreEvents?: number;
  },
) => {
  if (!deleted) return "";
  const parts = [
    [deleted.teams, "teams"],
    [deleted.players, "players"],
    [deleted.matches, "matches"],
    [deleted.matchPlayers, "matchPlayers"],
    [deleted.innings, "innings"],
    [deleted.inningsBatters, "inningsBatters"],
    [deleted.inningsBowlers, "inningsBowlers"],
    [deleted.scoreEvents, "scoreEvents"],
  ]
    .filter(([count]) => typeof count === "number")
    .map(([count, label]) => `${count} ${label}`);

  return parts.length ? ` Removed ${parts.join(", ")}.` : "";
};

export const TournamentDetailsPage = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams({ from: "/tournaments/$tournamentId/" });
  const id = tournamentId;
  const { data, isLoading, isError, error } = useTournament(id);
  const isCompleted = (data?.overview?.status ?? data?.status) === "COMPLETED";
  const matchesQuery = useTournamentMatchesQuery(id, {
    enabled: isCompleted,
  });
  const awardsQuery = useTournamentPlayerOfSeriesQuery(id, isCompleted);
  const teamsQuery = useTeamsByTournamentQuery(id);
  const {
    isOpen: isEditOpen,
    open: openEdit,
    close: closeEdit,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    open: openDelete,
    close: closeDelete,
  } = useDisclosure();
  const { can } = useAuthorization();
  const deleteMutation = useDeleteTournamentMutation(id);
  const canEdit = can("tournament.manage");

  if (!id) {
    return (
      <div className="rounded-2xl border border-error/40 bg-error-container p-6 text-sm text-on-error-container shadow-surface-lg backdrop-blur">
        Missing tournament id.
      </div>
    );
  }

  if (isLoading) {
    return <TournamentDetailsPageSkeleton />;
  }

  const handleDelete = async () => {
    try {
      const response = await deleteMutation.mutateAsync();
      closeDelete();
      toast.success(`Tournament deleted.${formatDeleteSummary(response.deleted)}`);
      await navigate({ to: "/tournaments" });
      return response;
    } catch (err) {
      const message = normalizeApiError(err).message || "Unable to delete tournament.";
      toast.error(message);
      return null;
    }
  };

  const finalMatch = matchesQuery.data?.find((match) => match.stage === "FINAL");
  const finalWinnerTeamName = (() => {
    if (
      !finalMatch ||
      finalMatch.status !== "COMPLETED" ||
      !finalMatch.result?.winnerTeamId
    ) {
      return null;
    }
    const winnerTeamId = finalMatch.result.winnerTeamId;
    const teamAId = finalMatch.teamAId ?? finalMatch.teamA?.id ?? null;
    const teamBId = finalMatch.teamBId ?? finalMatch.teamB?.id ?? null;

    if (winnerTeamId === teamAId) return finalMatch.teamA?.name ?? null;
    if (winnerTeamId === teamBId) return finalMatch.teamB?.name ?? null;
    return null;
  })();
  const canShowTournamentHonors = isCompleted && Boolean(finalWinnerTeamName);

  return (
    <div className="mx-auto w-full space-y-12">
      {isError ? (
        <div className="rounded-2xl border border-error/40 bg-error-container p-6 text-sm text-on-error-container shadow-surface-lg backdrop-blur">
          {error instanceof Error
            ? error.message
            : "Unable to load tournament."}
        </div>
      ) : null}

      {data ? (
        <>
          <PageHeader
            eyebrow="Tournament overview"
            title={data.name}
            description={
              data.overview?.type
                ? typeLabelMap[data.overview.type]
                : data.type
                  ? typeLabelMap[data.type]
                  : "Tournament details"
            }
            actions={
              <div className="flex items-center gap-2">
                <TournamentStatusPill
                  status={data.overview?.status ?? data.status}
                />
                {canEdit ? (
                  <TournamentHeaderActions
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ) : null}
              </div>
            }
          />
          {canShowTournamentHonors ? (
            <section className="rounded-2xl border border-success/35 bg-success-container/50 px-6 py-5 shadow-surface-lg">
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-on-success-container">
                Tournament Honors
              </p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-success/30 bg-surface/60 p-4">
                  <p className="font-display text-xs font-bold uppercase tracking-widest text-on-surface-muted">
                    Champions
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-on-surface">
                    {finalWinnerTeamName}
                  </p>
                </div>
                <div className="rounded-xl border border-success/30 bg-surface/60 p-4">
                  <p className="font-display text-xs font-bold uppercase tracking-widest text-on-surface-muted">
                    Player of the Series
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-on-surface">
                    {awardsQuery.data?.winner
                      ? `${awardsQuery.data.winner.name}${
                          awardsQuery.data.winner.team
                            ? ` (${awardsQuery.data.winner.team.shortName ?? awardsQuery.data.winner.team.name})`
                            : ""
                        }`
                      : awardsQuery.isLoading
                        ? "Loading..."
                        : "TBD"}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
          <TournamentDetailsCard
            tournament={data}
            teamCount={teamsQuery.data?.length}
          />
        </>
      ) : null}

      {data && canEdit ? (
        <>
          <TournamentEditModal
            tournament={data}
            isTypeLocked={false}
            isOpen={isEditOpen}
            onClose={closeEdit}
          />
          <TournamentDeleteModal
            tournamentName={data.name}
            isOpen={isDeleteOpen}
            isPending={deleteMutation.isPending}
            errorMessage={
              deleteMutation.isError
                ? normalizeApiError(deleteMutation.error).message
                : null
            }
            onClose={closeDelete}
            onConfirm={handleDelete}
          />
        </>
      ) : null}
    </div>
  );
};

