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

export type TeamAccessLink = {
  id: string;
  teamId: string;
  token?: string;
  expiresAt: string;
  accessUrl?: string;
  phoneNumber?: string | null;
  message?: string;
  whatsappUrl?: string | null;
};

export type TeamAccessCurrentShare = {
  id: string;
  teamId: string;
  expiresAt: string;
  accessUrl: string;
  phoneNumber: string | null;
  message: string;
  whatsappUrl: string | null;
};

export type TeamAccessWhatsappShare = {
  id: string;
  teamId: string;
  token: string;
  expiresAt: string;
  phoneNumber: string;
  accessUrl: string;
  message: string;
  whatsappUrl: string;
};

export type TeamAccessContext = {
  tournament: {
    id: string;
    name: string;
    type: "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";
    status: "DRAFT" | "ACTIVE" | "COMPLETED";
    oversPerInnings: number;
    ballsPerOver: number;
    startDate: string | null;
    endDate: string | null;
  };
  team: Team;
  players: Array<{
    id: string;
    teamId: string;
    fullName: string;
    jerseyNumber?: number | null;
    battingStyle?: import("@/features/players/types/players.types").BattingStyle | null;
    bowlingStyle?: import("@/features/players/types/players.types").BowlingStyle | null;
    isWicketKeeper: boolean;
    createdAt: string;
  }>;
};
