import type { PermissionAction } from "@/features/authz/types/authz.types";
import { hasPermission } from "@/features/authz/utils/permissions";
import type { MatchItem } from "../types/fixtures.types";
import type { Team } from "../../teams/types/teams.types";

const resolveTeamName = (
  fallback: MatchItem["teamA"] | MatchItem["teamB"] | null | undefined,
  teamId: string | null | undefined,
  teamMap: Map<string, Team>,
  byeFallback: string,
) => {
  if (teamId && teamMap.has(teamId)) {
    return teamMap.get(teamId)?.name ?? byeFallback;
  }
  if (fallback?.name) {
    return fallback.name;
  }
  return byeFallback;
};

export const mapMatchTeams = (
  matches: MatchItem[],
  teams: Team[],
): MatchItem[] => {
  const teamMap = new Map(teams.map((team) => [team.id, team]));

  return matches.map((match) => {
    const mappedTeamAId = match.teamAId ?? match.teamA?.id ?? null;
    const mappedTeamBId = match.teamBId ?? match.teamB?.id ?? null;

    return {
      ...match,
      teamAId: mappedTeamAId,
      teamBId: mappedTeamBId,
      teamA: {
        id: mappedTeamAId ?? "",
        name: resolveTeamName(match.teamA, mappedTeamAId, teamMap, "TBD"),
        shortName: match.teamA?.shortName ?? teamMap.get(mappedTeamAId ?? "")?.shortName,
      },
      teamB: mappedTeamBId
        ? {
            id: mappedTeamBId,
            name: resolveTeamName(match.teamB, mappedTeamBId, teamMap, "BYE"),
            shortName:
              match.teamB?.shortName ?? teamMap.get(mappedTeamBId)?.shortName,
          }
        : null,
    };
  });
};

export const canGenerateFixtures = (permissions: PermissionAction[]) =>
  hasPermission(permissions, "fixture.generate");

export const canEditRoster = (permissions: PermissionAction[]) =>
  hasPermission(permissions, "roster.manage");

export const canStartMatch = (permissions: PermissionAction[]) =>
  hasPermission(permissions, "match.start");

export const getGenerateFixturesErrorMessage = (
  status?: number,
  message?: string,
) => {
  if (status === 409) {
    return "Fixtures already generated.";
  }
  if (status === 400) {
    return "Not enough teams to generate fixtures.";
  }
  if (status === 401 || status === 403) {
    return "You do not have permission to generate fixtures.";
  }
  return message ?? "Unable to generate fixtures.";
};
