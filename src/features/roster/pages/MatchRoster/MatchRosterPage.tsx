import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { Tabs } from "@/components/ui/tabs/Tabs";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { usePlayersByTeamQuery } from "@/features/players/hooks/usePlayersByTeamQuery";
import { useMatchRosterQuery } from "../../hooks/useMatchRosterQuery";
import { useSetMatchRosterMutation } from "../../hooks/useSetMatchRosterMutation";
import { MatchRosterPageSkeleton } from "./MatchRosterPage.skeleton";
import { RosterTeamPanel } from "./RosterTeamPanel";
import { useMatchQuery } from "@/features/matches/hooks/useMatchQuery";
import type {
  RosterTeamEntry,
  SetRosterRequest,
} from "@/features/roster/types/roster.types";
import { getApiErrorMessage } from "@/shared/utils/apiErrors";
import type { ApiError } from "@/shared/types/http.types";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { PageStateGate } from "@/shared/components/page/PageStateGate";

export const MatchRosterPage = () => {
  const { tournamentId, matchId } = useParams({
    from: "/tournaments/$tournamentId/matches/$matchId/roster",
  });
  const search = useSearch({
    from: "/tournaments/$tournamentId/matches/$matchId/roster",
  });
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const canEdit = can("roster.manage");
  const [saveTeamId, setSaveTeamId] = useState<string | null>(null);
  const [activeTeamTab, setActiveTeamTab] = useState<"teamA" | "teamB">("teamA");
  const [tabStatusByTeam, setTabStatusByTeam] = useState<
    Record<string, "saved" | "unsaved" | "incomplete">
  >({});
  const hasSearchTeamContext = Boolean(search.teamAId);

  const {
    data: match,
    isLoading: isMatchLoading,
    isError: isMatchError,
    error: matchError,
  } = useMatchQuery(matchId, !hasSearchTeamContext);
  const {
    data: roster,
    isLoading: isRosterLoading,
    isError: isRosterError,
    error: rosterError,
  } = useMatchRosterQuery(matchId);
  const mutation = useSetMatchRosterMutation(matchId);

  const teamAId = search.teamAId || match?.teams.teamA?.id || "";
  const teamBId = search.teamBId || match?.teams.teamB?.id || null;
  const teamAName = search.teamAName || match?.teams.teamA?.name || "Team A";
  const teamBName = search.teamBName || match?.teams.teamB?.name || "Team B";

  const teamAPlayers = usePlayersByTeamQuery(teamAId ?? "");
  const teamBPlayers = usePlayersByTeamQuery(teamBId ?? "");

  const rosterTeams = useMemo(() => {
    const entries: Record<string, RosterTeamEntry | undefined> = {};
    (roster?.teams ?? []).forEach((entry) => {
      entries[entry.teamId] = entry;
    });
    return entries;
  }, [roster]);

  if (!matchId) {
    return (
      <div className="rounded-2xl border border-error-80 bg-error-95 p-6 text-sm text-error-40 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
        Missing match id.
      </div>
    );
  }

  const isLoading = (!hasSearchTeamContext && isMatchLoading) || isRosterLoading;

  const handleSave = async (teamId: string, payload: SetRosterRequest) => {
    try {
      setSaveTeamId(teamId);
      await mutation.mutateAsync(payload);
      toast.success("Roster saved.");
    } catch (err) {
      const status = (err as ApiError | undefined)?.status;
      if (status === 401) {
        window.location.assign("/login");
        return;
      }
      const message = getApiErrorMessage(err, "Unable to save roster.");
      toast.error(message);
      throw err;
    } finally {
      setSaveTeamId(null);
    }
  };

  const status =
    (matchError as ApiError | undefined)?.status ??
    (rosterError as ApiError | undefined)?.status;
  const isUnauthorized = status === 401;
  const loadErrorMessage =
    (!hasSearchTeamContext && isMatchError) || isRosterError
      ? matchError instanceof Error
        ? matchError.message
        : rosterError instanceof Error
          ? rosterError.message
          : "Unable to load roster."
      : null;
  const getTabStatus = (teamId: string) => tabStatusByTeam[teamId] ?? "saved";
  const getTabStatusLabel = (status: "saved" | "unsaved" | "incomplete") =>
    status === "saved" ? "Saved" : status === "unsaved" ? "Unsaved" : "Incomplete";
  const getTabStatusDotClassName = (status: "saved" | "unsaved" | "incomplete") =>
    status === "saved"
      ? "bg-success-40"
      : status === "unsaved"
        ? "bg-secondary-40"
        : "bg-error-40";
  const handleTabStatusChange = (
    teamId: string,
    status: "saved" | "unsaved" | "incomplete",
  ) => {
    setTabStatusByTeam((prev) =>
      prev[teamId] === status ? prev : { ...prev, [teamId]: status },
    );
  };

  return (
    <PageStateGate
      isLoading={isLoading}
      loadingFallback={<MatchRosterPageSkeleton />}
      isUnauthorized={isUnauthorized}
      errorMessage={loadErrorMessage}
      isNotFound={!teamAId}
      notFoundMessage="Match team details are missing."
      alertClassName="shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] backdrop-blur"
    >
      {teamAId ? (
        <div className="mx-auto w-full max-w-6xl space-y-8 px-6">
          <PageHeader
            eyebrow="Match roster"
            title="Playing XI"
            description="Pick the squad, captain, and keeper for each team."
            backButton={{
              onClick: () =>
                navigate({
                  to: "/tournaments/$tournamentId/fixtures",
                  params: { tournamentId },
                }),
              ariaLabel: "Back to fixtures",
            }}
          />
          <div className="space-y-4">
            {teamBId ? (
              <>
                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-40">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-success-40" />
                    Saved
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-secondary-40" />
                    Unsaved
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-error-40" />
                    Incomplete
                  </span>
                </div>
                <Tabs
                  value={activeTeamTab}
                  onChange={(next) => setActiveTeamTab(next as "teamA" | "teamB")}
                  items={[
                    {
                      value: "teamA",
                      title: getTabStatusLabel(getTabStatus(teamAId)),
                      label: (
                        <span className="flex items-center gap-2">
                          <span>{teamAName}</span>
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${getTabStatusDotClassName(getTabStatus(teamAId))}`}
                          />
                        </span>
                      ),
                    },
                    {
                      value: "teamB",
                      title: getTabStatusLabel(getTabStatus(teamBId)),
                      label: (
                        <span className="flex items-center gap-2">
                          <span>{teamBName}</span>
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${getTabStatusDotClassName(getTabStatus(teamBId))}`}
                          />
                        </span>
                      ),
                    },
                  ]}
                />
              </>
            ) : null}

            <div className={teamBId && activeTeamTab !== "teamA" ? "hidden" : ""}>
              <RosterTeamPanel
                key={`${teamAId}:${JSON.stringify(rosterTeams[teamAId] ?? null)}`}
                teamId={teamAId}
                teamName={teamAName}
                showTeamHeader={!teamBId}
                rosterTeam={rosterTeams[teamAId]}
                players={teamAPlayers.data ?? []}
                isLoading={teamAPlayers.isLoading}
                canEdit={canEdit}
                isSaving={mutation.isPending && saveTeamId === teamAId}
                onSave={(payload) => handleSave(teamAId, payload)}
                onStatusChange={handleTabStatusChange}
              />
            </div>

            {teamBId ? (
              <div className={activeTeamTab !== "teamB" ? "hidden" : ""}>
                <RosterTeamPanel
                  key={`${teamBId}:${JSON.stringify(rosterTeams[teamBId] ?? null)}`}
                  teamId={teamBId}
                  teamName={teamBName}
                  showTeamHeader={!teamBId}
                  rosterTeam={rosterTeams[teamBId]}
                  players={teamBPlayers.data ?? []}
                  isLoading={teamBPlayers.isLoading}
                  canEdit={canEdit}
                  isSaving={mutation.isPending && saveTeamId === teamBId}
                  onSave={(payload) => handleSave(teamBId, payload)}
                  onStatusChange={handleTabStatusChange}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </PageStateGate>
  );
};
