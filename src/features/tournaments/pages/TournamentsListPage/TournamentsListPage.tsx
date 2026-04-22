import { useState } from "react";
import { toast } from "sonner";
import { useTournamentsList } from "../../hooks/useTournamentsList";
import { TournamentsList } from "./TournamentsList";
import { TournamentsListPageSkeleton } from "./TournamentsListPage.skeleton";
import { Button } from "@/components/ui/button/Button";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { TournamentCreateModal } from "../../components/TournamentCreateModal";
import { TournamentDeleteModal } from "../../components/TournamentDeleteModal";
import { BackgroundDecor } from "@/shared/components/layout/BackgroundDecor";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { useDeleteTournamentMutation } from "../../hooks/useDeleteTournamentMutation";
import { useDuplicateTournamentMutation } from "../../hooks/useDuplicateTournamentMutation";
import type { TournamentSummary } from "../../types/tournamentTypes";
import { normalizeApiError } from "@/shared/utils/apiErrors";

export const TournamentsListPage = () => {
  const { data, isLoading, isError, error } = useTournamentsList();
  const { isOpen, open, close } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    open: openDelete,
    close: closeDelete,
  } = useDisclosure();
  const [deletingTournament, setDeletingTournament] =
    useState<TournamentSummary | null>(null);
  const deleteMutation = useDeleteTournamentMutation(
    deletingTournament?.id ?? "",
  );
  const duplicateMutation = useDuplicateTournamentMutation();
  const { can } = useAuthorization();
  const canManageTournament = can("tournament.manage");

  if (isLoading) {
    return <TournamentsListPageSkeleton />;
  }

  const handleDelete = async () => {
    if (!deletingTournament) return;

    try {
      await deleteMutation.mutateAsync();
      toast.success("Tournament deleted.");
      closeDelete();
      setDeletingTournament(null);
    } catch (err) {
      const message =
        normalizeApiError(err).message || "Unable to delete tournament.";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl mt-5 w-full space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-secondary/35 bg-linear-to-r from-secondary-container via-secondary-container to-primary-container p-8 shadow-surface-lg backdrop-blur">
        <BackgroundDecor
          imageType="Ball"
          className="absolute -right-10 -bottom-1 w-60 rotate-12 opacity-15"
        />
        <BackgroundDecor
          imageType="Ball"
          className="absolute -bottom-10 -left-10 w-36 opacity-20"
        />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-primary-container">
              Tournaments
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-on-surface">
              Manage your tenant tournaments.
            </h1>
          </div>
          {canManageTournament ? (
            <Button
              type="button"
              appearance="filled"
              color="primary"
              size="md"
              onClick={open}
            >
              Create tournament
            </Button>
          ) : null}
        </div>
        <p className="relative z-10 mt-3 text-sm text-on-primary-container">
          Create and monitor tournaments across your organization.
        </p>
      </section>

      {isError ? (
        <div className="rounded-2xl border border-error/40 bg-error-container p-6 text-sm text-on-error-container shadow-surface-lg backdrop-blur">
          {error instanceof Error
            ? error.message
            : "Unable to load tournaments."}
        </div>
      ) : null}
      {data && data.length === 0 ? (
        <div className="rounded-2xl border border-outline bg-surface-container p-6 text-sm text-on-surface-muted shadow-surface-lg backdrop-blur">
          No tournaments yet. Create one to get started.
        </div>
      ) : null}
      {data && data.length > 0 ? (
        <TournamentsList
          tournaments={data}
          canManage={canManageTournament}
          onDuplicate={(tournament) => {
            void duplicateMutation
              .mutateAsync(tournament.id)
              .then(() => {
                toast.success("Tournament duplicated.");
              })
              .catch((err) => {
                const message =
                  normalizeApiError(err).message || "Unable to duplicate tournament.";
                toast.error(message);
              });
          }}
          onDelete={(tournament) => {
            setDeletingTournament(tournament);
            openDelete();
          }}
        />
      ) : null}
      {canManageTournament ? (
        <TournamentCreateModal isOpen={isOpen} onClose={close} />
      ) : null}
      {deletingTournament ? (
        <TournamentDeleteModal
          tournamentName={deletingTournament.name}
          isOpen={isDeleteOpen}
          isPending={deleteMutation.isPending}
          errorMessage={
            deleteMutation.isError
              ? normalizeApiError(deleteMutation.error).message
              : null
          }
          onClose={() => {
            closeDelete();
            setDeletingTournament(null);
          }}
          onConfirm={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
};
