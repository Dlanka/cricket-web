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
import { PageHeader } from "@/shared/components/page/PageHeader";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";

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
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const { can } = useAuthorization();
  const canEdit = can("tournament.manage");

  if (!teamId) {
    return (
      <div className="rounded-2xl border border-error-80 bg-error-95 p-6 text-sm text-error-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
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
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6">
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
            <Button
              type="button"
              appearance="filled"
              color="primary"
              size="sm"
              onClick={open}
            >
              Add player
            </Button>
          ) : null
        }
      />
      {isError ? (
        <div className="rounded-2xl border border-error-80 bg-error-95 p-6 text-sm text-error-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
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
          <div className="rounded-2xl border border-neutral-90 bg-neutral-99 p-6 text-sm text-neutral-40">
            No players yet for this team.
          </div>
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
    </div>
  );
};
