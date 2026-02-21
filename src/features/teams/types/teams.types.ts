export type Team = {
  id: string;
  tournamentId: string;
  name: string;
  shortName?: string | null;
  createdAt: string;
};

export type CreateTeamRequest = {
  name: string;
  shortName?: string;
};

export type UpdateTeamRequest = {
  name?: string;
  shortName?: string;
};

export type UpdateTeamResponse = Team;

export type ListTeamsResponse = {
  items: Team[];
};
