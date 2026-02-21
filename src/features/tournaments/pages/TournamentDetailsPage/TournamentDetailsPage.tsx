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
      <div className="rounded-2xl border border-error-80 bg-error-95 p-6 text-sm text-error-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
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
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {isError ? (
        <div className="rounded-2xl border border-error-80 bg-error-95 p-6 text-sm text-error-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
          {error instanceof Error
            ? error.message
            : "Unable to load tournament."}
        </div>
      ) : null}

      {data ? (
        <>
          <TournamentDetailsCard
            tournament={data}
            teamCount={teamsQuery.data?.length}
            canEdit={canEdit}
            onEdit={openEdit}
            onDelete={canEdit ? openDelete : undefined}
          />
        </>
      ) : null}

      {data && canEdit ? (
        <>
          <TournamentEditModal
            tournament={data}
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
