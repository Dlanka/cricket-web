import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useTeamsByTournamentQuery } from "../../hooks/useTeamsByTournamentQuery";
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

export const TeamsByTournamentPage = () => {
  const { tournamentId } = useParams({
    from: "/tournaments/$tournamentId/teams/",
  });
  const { data, isLoading, isError, error } =
    useTeamsByTournamentQuery(tournamentId);
  const { isOpen, open, close } = useDisclosure();
  const { can } = useAuthorization();
  const canEdit = can("tournament.manage");
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
