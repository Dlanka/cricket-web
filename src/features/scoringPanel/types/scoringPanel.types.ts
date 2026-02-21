export type ScoreEventType =
  | "run"
  | "extra"
  | "wicket"
  | "swap"
  | "retire"
  | "undo";

export type ExtraType = "wide" | "noBall" | "byes" | "legByes";

export type WicketType =
  | "bowled"
  | "caught"
  | "lbw"
  | "stumping"
  | "hitWicket"
  | "runOutStriker"
  | "runOutNonStriker"
  | "obstructingField";

export type WicketExtraType = "wide" | "noBall" | "none";

export type RunValue = 0 | 1 | 2 | 3 | 4 | 6;

export type RunEventRequest = {
  type: "run";
  runs: RunValue;
  bowlerId?: string;
};

export type ExtraEventRequest = {
  type: "extra";
  extraType: ExtraType;
  additionalRuns: number;
  bowlerId?: string;
};

export type WicketEventRequest = {
  type: "wicket";
  wicketType: WicketType;
  extraType?: WicketExtraType;
  newBatterId?: string;
  newBatterName?: string;
  runOutBatsman?: "striker" | "nonStriker";
  runsWithWicket: RunValue;
  bowlerId?: string;
};

export type SwapRequest = {
  type: "swap";
};

export type UndoRequest = {
  type: "undo";
};

export type RetireRequest = {
  type: "retire";
  retiringBatter: "striker" | "nonStriker";
  newBatterId?: string;
  newBatterName?: string;
  reason?: string;
};

export type ScoreEventRequest =
  | RunEventRequest
  | ExtraEventRequest
  | WicketEventRequest
  | SwapRequest
  | UndoRequest
  | RetireRequest;

export type ScoreEventResponse = {
  matchId: string;
  inningsId: string;
  inningsCompleted: boolean;
  isMatchCompleted?: boolean;
  score: {
    runs: number;
    wickets: number;
    balls: number;
    overs: string;
    extras: number;
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
  current: {
    strikerId: string;
    nonStrikerId: string;
    bowlerId: string;
  };
  currentOver: {
    overNumber: number;
    balls: { seq?: number; display: string; isLegal: boolean }[];
  };
  event: {
    id: string;
    seq: number;
    type: string;
  };
};

export type AvailableNextBattersResponse = {
  strikerId: string;
  nonStrikerId: string;
  items: { playerId: string; fullName: string }[];
};

export type PanelState = {
  selectedExtraType: ExtraType | null;
  additionalRuns: number;
  wicketSelected: boolean;
};
