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

