import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTeamsByTournamentQuery } from "../../hooks/useTeamsByTournamentQuery";
import { useDeleteTeamMutation } from "../../hooks/useDeleteTeamMutation";
import { useReorderTeamsMutation } from "../../hooks/useReorderTeamsMutation";
import { TeamsByTournamentPageSkeleton } from "./TeamsByTournamentPage.skeleton";
import { TeamsList } from "./TeamsList";
import { Button } from "@/components/ui/button/Button";
import { TeamCreateModal } from "../../components/TeamCreateModal";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { TeamEditModal } from "../../components/TeamEditModal";
import type { Team } from "../../types/teams.types";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { TeamAccessLinksModal } from "@/features/teams/components/TeamAccessLinksModal";
import { TournamentCard } from "@/features/tournament-ui/components/TournamentCard";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { Plus } from "lucide-react";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { useTournament } from "@/features/tournaments/hooks/useTournament";

export const TeamsByTournamentPage = () => {
  const { tournamentId } = useParams({
    from: "/tournaments/$tournamentId/teams/",
  });
  const { data, isLoading, isError, error } =
    useTeamsByTournamentQuery(tournamentId);
  const tournamentQuery = useTournament(tournamentId);
  const queryClient = useQueryClient();
  const { isOpen, open, close } = useDisclosure();
  const { can } = useAuthorization();
  const canEdit = can("tournament.manage");
  const deleteMutation = useDeleteTeamMutation(tournamentId);
  const reorderMutation = useReorderTeamsMutation(tournamentId);
  const {
    isOpen: isEditOpen,
    open: openEdit,
    close: closeEdit,
  } = useDisclosure();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const {
    isOpen: isLinksOpen,
    open: openLinks,
    close: closeLinks,
  } = useDisclosure();
  const [linksTeam, setLinksTeam] = useState<Team | null>(null);

  if (!tournamentId) {
    return (
      <div className="rounded-2xl border border-error/40 bg-error-container p-6 text-sm text-on-error-container shadow-surface-lg backdrop-blur">
        Missing tournament id.
      </div>
    );
  }

  if (isLoading) {
    return <TeamsByTournamentPageSkeleton />;
  }

  const canReorderTeams =
    canEdit &&
    (tournamentQuery.data?.type === "KNOCKOUT" ||
      tournamentQuery.data?.type === "LEAGUE_KNOCKOUT");

  const handleDeleteTeam = async (team: Team) => {
    if (!window.confirm(`Delete team "${team.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(team.id);
      toast.success("Team deleted.");
    } catch (error) {
      toast.error(normalizeApiError(error).message || "Unable to delete team.");
    }
  };

  const commitTeamOrder = async () => {
    const teams = (queryClient.getQueryData(["teams", tournamentId]) as Team[] | undefined) ?? data ?? [];
    if (!canReorderTeams || teams.length === 0) return;
    try {
      await reorderMutation.mutateAsync(teams.map((team) => team.id));
      toast.success("Team order updated.");
    } catch (error) {
      toast.error(normalizeApiError(error).message || "Unable to update team order.");
    }
  };

  return (
    <div className="mx-auto w-full space-y-12">
      <PageHeader
        eyebrow="Teams"
        title="Teams for tournament"
        description="Manage squads participating in this tournament."
        actions={
          canEdit ? (
            <Button
              type="button"
              appearance="filled"
              color="primary"
              size="sm"
              uppercase
              icon={<Plus size={16} />}
              onClick={open}
            >
              Add team
            </Button>
          ) : null
        }
      />
      {isError ? (
        <div className="rounded-2xl border border-error/35 bg-error-container p-6 text-sm text-on-error-container shadow-surface-lg backdrop-blur">
          {error instanceof Error ? error.message : "Unable to load teams."}
        </div>
      ) : null}
      <div>
        {data && data.length > 0 ? (
          <TeamsList
            teams={data}
            tournamentId={tournamentId}
            canEdit={canEdit}
            onEdit={(team) => {
              setEditingTeam(team);
              openEdit();
            }}
            onAccessLinks={(team) => {
              setLinksTeam(team);
              openLinks();
            }}
            onDelete={handleDeleteTeam}
            deletingTeamId={deleteMutation.isPending ? deleteMutation.variables : null}
            canReorder={canReorderTeams}
            onReorder={(nextTeams) => {
              queryClient.setQueryData(["teams", tournamentId], nextTeams);
            }}
            onReorderEnd={() => {
              void commitTeamOrder();
            }}
          />
        ) : (
          <TournamentCard muted>
            <p className="text-sm text-on-surface-variant">
              No teams yet for this tournament.
            </p>
          </TournamentCard>
        )}
      </div>
      {canEdit ? (
        <TeamCreateModal
          tournamentId={tournamentId}
          isOpen={isOpen}
          onClose={close}
        />
      ) : null}
      {editingTeam ? (
        <TeamEditModal
          tournamentId={tournamentId}
          team={editingTeam}
          isOpen={isEditOpen}
          onClose={() => {
            closeEdit();
            setEditingTeam(null);
          }}
        />
      ) : null}
      {linksTeam ? (
        <TeamAccessLinksModal
          teamId={linksTeam.id}
          teamName={linksTeam.name}
          teamContactNumber={linksTeam.contactNumber}
          isOpen={isLinksOpen}
          onClose={closeLinks}
        />
      ) : null}
    </div>
  );
};
