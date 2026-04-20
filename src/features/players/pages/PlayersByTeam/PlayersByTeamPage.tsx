import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { usePlayersByTeamQuery } from "../../hooks/usePlayersByTeamQuery";
import { PlayersByTeamPageSkeleton } from "./PlayersByTeamPage.skeleton";
import { PlayersList } from "./PlayersList";
import { useDeletePlayerMutation } from "../../hooks/useDeletePlayerMutation";
import { toast } from "sonner";
import { PlayerCreateModal } from "../../components/PlayerCreateModal";
import { Button } from "@/components/ui/button/Button";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { PlayerEditModal } from "../../components/PlayerEditModal";
import type { Player } from "../../types/players.types";
import { useTeamQuery } from "@/features/teams/hooks/useTeamQuery";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { TeamAccessLinksModal } from "@/features/teams/components/TeamAccessLinksModal";
import { TournamentCard } from "@/features/tournament-ui/components/TournamentCard";
import { PageHeader } from "@/shared/components/page/PageHeader";

export const PlayersByTeamPage = () => {
  const { tournamentId, teamId } = useParams({
    from: "/tournaments/$tournamentId/teams/$teamId/players",
  });
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePlayersByTeamQuery(teamId);
  const { data: team } = useTeamQuery(teamId);
  const deleteMutation = useDeletePlayerMutation(teamId);
  const { isOpen, open, close } = useDisclosure();
  const {
    isOpen: isEditOpen,
    open: openEdit,
    close: closeEdit,
  } = useDisclosure();
  const {
    isOpen: isLinksOpen,
    open: openLinks,
    close: closeLinks,
  } = useDisclosure();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const { can } = useAuthorization();
  const canEdit = can("tournament.manage");

  if (!teamId) {
    return (
      <div className="rounded-2xl border border-error/40 bg-error-container p-6 text-sm text-on-error-container shadow-surface-lg backdrop-blur">
        Missing team id.
      </div>
    );
  }

  if (isLoading) {
    return <PlayersByTeamPageSkeleton />;
  }

  const handleDelete = async (playerId: string) => {
    try {
      await deleteMutation.mutateAsync(playerId);
      toast.success("Player removed.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete player.";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto w-full space-y-12">
      <PageHeader
        eyebrow="Players"
        title={team?.name ? `${team.name} squad` : "Team squad"}
        description="Maintain the roster for this team."
        backButton={{
          onClick: () =>
            navigate({
              to: "/tournaments/$tournamentId/teams",
              params: { tournamentId },
            }),
          ariaLabel: "Back to teams",
        }}
        actions={
          canEdit ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                appearance="soft"
                color="neutral"
                size="sm"
                onClick={openLinks}
              >
                Access links
              </Button>
              <Button
                type="button"
                appearance="soft"
                color="primary"
                size="sm"
                onClick={open}
              >
                Add player
              </Button>
            </div>
          ) : null
        }
      />
      {isError ? (
        <div className="rounded-2xl border border-error/35 bg-error-container p-6 text-sm text-on-error-container shadow-surface-lg backdrop-blur">
          {error instanceof Error ? error.message : "Unable to load players."}
        </div>
      ) : null}
      <div>
        {data && data.length > 0 ? (
          <PlayersList
            players={data}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            canEdit={canEdit}
            onEdit={(player) => {
              setEditingPlayer(player);
              openEdit();
            }}
          />
        ) : (
          <TournamentCard muted>
            <p className="text-sm text-on-surface-variant">
              No players yet for this team.
            </p>
          </TournamentCard>
        )}
      </div>
      {canEdit ? (
        <PlayerCreateModal teamId={teamId} isOpen={isOpen} onClose={close} />
      ) : null}
      {editingPlayer ? (
        <PlayerEditModal
          teamId={teamId}
          player={editingPlayer}
          isOpen={isEditOpen}
          onClose={() => {
            closeEdit();
            setEditingPlayer(null);
          }}
        />
      ) : null}
      {team ? (
        <TeamAccessLinksModal
          teamId={team.id}
          teamName={team.name}
          teamContactNumber={team.contactNumber}
          isOpen={isLinksOpen}
          onClose={closeLinks}
        />
      ) : null}
    </div>
  );
};

