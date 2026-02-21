import { Link } from "@tanstack/react-router";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { Card } from "@/shared/components/card/Card";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { MatchStartForm } from "@/features/scoring/pages/MatchStart/MatchStartForm";
import type { MatchDetail, StartMatchRequest } from "@/features/matches/types/matches.types";
import type { PlayerOption } from "../hooks/useMatchCenterPage";

type Props = {
  match: MatchDetail;
  matchId: string;
  canEditConfig: boolean;
  canStart: boolean;
  isConfigInputDisabled: boolean;
  oversPerInningsInput: string;
  ballsPerOverInput: string;
  setOversPerInningsInput: (value: string) => void;
  setBallsPerOverInput: (value: string) => void;
  configError: string | null;
  submitError: string | null;
  teamAPlaying: PlayerOption[];
  teamBPlaying: PlayerOption[];
  isStartSubmitting: boolean;
  onStart: (payload: StartMatchRequest) => Promise<void>;
};

export const MatchCenterScheduledCard = ({
  match,
  matchId,
  canEditConfig,
  canStart,
  isConfigInputDisabled,
  oversPerInningsInput,
  ballsPerOverInput,
  setOversPerInningsInput,
  setBallsPerOverInput,
  configError,
  submitError,
  teamAPlaying,
  teamBPlaying,
  isStartSubmitting,
  onStart,
}: Props) => {
  const hasRosterConfigured = teamAPlaying.length > 0 && teamBPlaying.length > 0;

  return (
    <Card>
      {hasRosterConfigured ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
            Match config
          </p>
          <div className="mt-4 grid gap-4 text-sm text-neutral-40 md:grid-cols-2">
            <div>
              {canEditConfig ? (
                <FormGroup label="Overs per innings">
                  <div className="mt-1 flex items-center gap-2">
                    <InputField
                      type="number"
                      min={1}
                      value={oversPerInningsInput}
                      disabled={isConfigInputDisabled}
                      onChange={(event) => setOversPerInningsInput(event.target.value)}
                      className="mt-0 w-24"
                    />
                    <span className="text-base font-semibold text-primary-10">overs</span>
                  </div>
                </FormGroup>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-[0.2em]">Overs</p>
                  <p className="mt-1 text-base font-semibold text-primary-10">
                    {match.oversPerInnings} overs
                  </p>
                </>
              )}
            </div>
            <div>
              {canEditConfig ? (
                <FormGroup label="Balls per over">
                  <div className="mt-1 flex items-center gap-2">
                    <InputField
                      type="number"
                      min={1}
                      value={ballsPerOverInput}
                      disabled={isConfigInputDisabled}
                      onChange={(event) => setBallsPerOverInput(event.target.value)}
                      className="mt-0 w-24"
                    />
                  </div>
                </FormGroup>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-[0.2em]">Balls per over</p>
                  <p className="mt-1 text-base font-semibold text-primary-10">
                    {match.ballsPerOver}
                  </p>
                </>
              )}
            </div>
          </div>
          {canEditConfig ? (
            <p className="mt-4 text-xs text-neutral-40">
              Match config is saved automatically when you click Start match.
            </p>
          ) : null}
          {configError ? (
            <div className="mt-3 rounded-xl border border-error-80 bg-error-95 px-3 py-2 text-xs text-error-40">
              {configError}
            </div>
          ) : null}
        </>
      ) : null}

      <div className={hasRosterConfigured ? "mt-6 border-t border-neutral-90 pt-5" : ""}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
        Start match
      </p>
      <div className="mt-4">
        {!hasRosterConfigured ? (
          <EmptyState
            title="Playing XI not set"
            description="Set roster before starting the match."
            action={
              <Link
                to="/tournaments/$tournamentId/matches/$matchId/roster"
                params={{ tournamentId: match.tournamentId, matchId }}
                search={{
                  teamAId: match.teams.teamA.id,
                  teamBId: match.teams.teamB?.id ?? "",
                  teamAName: match.teams.teamA.name,
                  teamBName: match.teams.teamB?.name ?? "Team B",
                }}
                className="rounded-full border border-neutral-90 px-4 py-2 text-sm font-semibold text-primary-20"
              >
                Set roster
              </Link>
            }
          />
        ) : (
          <MatchStartForm
            match={match}
            options={{ teamAPlayers: teamAPlaying, teamBPlayers: teamBPlaying }}
            isSubmitting={isStartSubmitting}
            canStart={canStart}
            onSubmit={onStart}
            errorMessage={submitError}
            alignSubmitRight
          />
        )}
      </div>
    </div>
    </Card>
  );
};
