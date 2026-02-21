export type RosterPlayerEntry = {
  playerId: string;
  isPlaying: boolean;
  isCaptain?: boolean;
  isKeeper?: boolean;
};

export type RosterTeamEntry = {
  teamId: string;
  players: RosterPlayerEntry[];
};

export type GetRosterResponse = {
  matchId: string;
  teams: RosterTeamEntry[];
};

export type SetRosterRequest = {
  teamId: string;
  playingPlayerIds: string[];
  captainId?: string;
  keeperId?: string;
};

export type SetRosterResponse = {
  count: number;
};
