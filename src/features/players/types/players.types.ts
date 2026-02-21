export type BattingStyle = "RIGHT_HAND_BAT" | "LEFT_HAND_BAT";

export type BowlingStyle =
  | "RIGHT_ARM_FAST"
  | "RIGHT_ARM_FAST_MEDIUM"
  | "RIGHT_ARM_MEDIUM"
  | "RIGHT_ARM_OFF_BREAK"
  | "RIGHT_ARM_LEG_BREAK"
  | "LEFT_ARM_FAST"
  | "LEFT_ARM_FAST_MEDIUM"
  | "LEFT_ARM_MEDIUM"
  | "LEFT_ARM_ORTHODOX"
  | "LEFT_ARM_WRIST_SPIN";

export type Player = {
  id: string;
  teamId: string;
  fullName: string;
  jerseyNumber?: number | null;
  battingStyle?: BattingStyle | null;
  bowlingStyle?: BowlingStyle | null;
  isWicketKeeper: boolean;
  createdAt: string;
};

export type CreatePlayerRequest = {
  fullName: string;
  jerseyNumber?: number;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  isWicketKeeper?: boolean;
};

export type UpdatePlayerRequest = {
  fullName?: string;
  jerseyNumber?: number;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  isWicketKeeper?: boolean;
};

export type UpdatePlayerResponse = Player;

export type ListPlayersResponse = {
  items: Player[];
};
