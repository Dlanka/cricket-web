export type Team = {
  id: string;
  tournamentId: string;
  name: string;
  shortName?: string | null;
  contactPerson?: string | null;
  contactNumber?: string | null;
  createdAt: string;
};

export type CreateTeamRequest = {
  name: string;
  shortName?: string;
  contactPerson?: string;
  contactNumber?: string;
};

export type UpdateTeamRequest = {
  name?: string;
  shortName?: string;
  contactPerson?: string | null;
  contactNumber?: string | null;
};

export type UpdateTeamResponse = Team;

export type ListTeamsResponse = {
  items: Team[];
};
