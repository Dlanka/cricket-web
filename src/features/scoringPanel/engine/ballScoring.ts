export type ExtraType = "NONE" | "WD" | "NB" | "B" | "LB";

export type WicketType =
  | "NONE"
  | "RUN_OUT"
  | "STUMPED"
  | "CAUGHT"
  | "BOWLED"
  | "LBW"
  | "HIT_WICKET"
  | "OBSTRUCTING_FIELD";

export type RunValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type BallEventInput = {
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  overNumber: number;
  ballInOverIndex: number;
  extraType: ExtraType;
  runsOffBat: RunValue;
  additionalRuns: RunValue;
  boundary: "NONE" | "FOUR" | "SIX";
  wicket: {
    happened: boolean;
    type: WicketType;
    playerOutId?: string;
    isStrikerOut?: boolean;
  };
};

export type DismissalRecorded = {
  type: WicketType;
  playerOutId?: string;
  isStrikerOut?: boolean;
};

export type BallEventResult = {
  legalDelivery: boolean;
  teamRunsAdd: number;
  batterRunsAdd: number;
  extrasAdd: { wd: number; nb: number; b: number; lb: number };
  bowlerRunsConcededAdd: number;
  wicketAdd: boolean;
  dismissalRecorded?: DismissalRecorded;
  nextStrikerId: string;
  nextNonStrikerId: string;
  overCompleted: boolean;
  warnings: string[];
};

export type BatterStats = {
  id: string;
  runs: number;
  balls: number;
  out: boolean;
};

export type BowlerStats = {
  id: string;
  balls: number;
  runsConceded: number;
  wickets: number;
};

export type FeedItem = {
  input: BallEventInput;
  result: BallEventResult;
  previousState: Omit<MatchState, "ballFeed">;
};

export type MatchState = {
  ballsPerOver: number;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  totalRuns: number;
  wickets: number;
  legalBalls: number;
  extras: { wd: number; nb: number; b: number; lb: number };
  currentRunRate: number;
  overs: string;
  batterStats: Record<string, BatterStats>;
  bowlerStats: Record<string, BowlerStats>;
  ballFeed: FeedItem[];
};

const NEW_BATTER_PLACEHOLDER = "__NEW_BATTER__";

const WD_ALLOWED_WICKETS = new Set<WicketType>([
  "RUN_OUT",
  "STUMPED",
  "OBSTRUCTING_FIELD",
  "HIT_WICKET",
]);

const NB_ALLOWED_WICKETS = new Set<WicketType>(["RUN_OUT", "OBSTRUCTING_FIELD"]);

const BOWLER_WICKET_TYPES = new Set<WicketType>([
  "BOWLED",
  "CAUGHT",
  "LBW",
  "HIT_WICKET",
  "STUMPED",
]);

const clampRun = (value: number): RunValue => {
  if (value <= 0) return 0;
  if (value === 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  if (value === 4) return 4;
  if (value === 5) return 5;
  return 6;
};

const formatOvers = (legalBalls: number, ballsPerOver: number) => {
  const complete = Math.floor(legalBalls / ballsPerOver);
  const remainder = legalBalls % ballsPerOver;
  return `${complete}.${remainder}`;
};

const calcRunRate = (runs: number, legalBalls: number, ballsPerOver: number) => {
  if (legalBalls <= 0) return 0;
  return runs / (legalBalls / ballsPerOver);
};

const snapshotState = (state: MatchState): Omit<MatchState, "ballFeed"> => ({
  ballsPerOver: state.ballsPerOver,
  strikerId: state.strikerId,
  nonStrikerId: state.nonStrikerId,
  bowlerId: state.bowlerId,
  totalRuns: state.totalRuns,
  wickets: state.wickets,
  legalBalls: state.legalBalls,
  extras: { ...state.extras },
  currentRunRate: state.currentRunRate,
  overs: state.overs,
  batterStats: Object.fromEntries(
    Object.entries(state.batterStats).map(([id, row]) => [id, { ...row }]),
  ),
  bowlerStats: Object.fromEntries(
    Object.entries(state.bowlerStats).map(([id, row]) => [id, { ...row }]),
  ),
});

const assertValidInput = (input: BallEventInput) => {
  if (input.extraType === "WD" && input.runsOffBat !== 0) {
    throw new Error("WD cannot have runsOffBat.");
  }
  if ((input.extraType === "B" || input.extraType === "LB") && input.runsOffBat !== 0) {
    throw new Error(`${input.extraType} cannot have runsOffBat.`);
  }
  if (input.extraType === "NONE" && input.additionalRuns !== 0) {
    throw new Error("Normal ball cannot have additionalRuns.");
  }
  if (input.boundary === "FOUR" && input.runsOffBat !== 4) {
    throw new Error("FOUR boundary requires runsOffBat = 4.");
  }
  if (input.boundary === "SIX" && input.runsOffBat !== 6) {
    throw new Error("SIX boundary requires runsOffBat = 6.");
  }
};

const normalizeWicketType = (input: BallEventInput, warnings: string[]): WicketType => {
  if (!input.wicket.happened) return "NONE";
  const original = input.wicket.type;
  if (original === "NONE") return "RUN_OUT";

  if (input.extraType === "WD" && !WD_ALLOWED_WICKETS.has(original)) {
    warnings.push(`Invalid wicket ${original} on WD. Auto-corrected to RUN_OUT.`);
    return "RUN_OUT";
  }
  if (input.extraType === "NB" && !NB_ALLOWED_WICKETS.has(original)) {
    warnings.push(`Invalid wicket ${original} on NB. Auto-corrected to RUN_OUT.`);
    return "RUN_OUT";
  }
  return original;
};

const rotateForRuns = (strikerId: string, nonStrikerId: string, runs: number) => {
  if (runs % 2 === 1) {
    return { strikerId: nonStrikerId, nonStrikerId: strikerId };
  }
  return { strikerId, nonStrikerId };
};

const ensureBatter = (state: MatchState, batterId: string): BatterStats => {
  const existing = state.batterStats[batterId];
  if (existing) return existing;
  const created: BatterStats = { id: batterId, runs: 0, balls: 0, out: false };
  state.batterStats[batterId] = created;
  return created;
};

const ensureBowler = (state: MatchState, bowlerId: string): BowlerStats => {
  const existing = state.bowlerStats[bowlerId];
  if (existing) return existing;
  const created: BowlerStats = { id: bowlerId, balls: 0, runsConceded: 0, wickets: 0 };
  state.bowlerStats[bowlerId] = created;
  return created;
};

export const computeBallResult = (
  input: BallEventInput,
  matchState: MatchState,
): BallEventResult => {
  assertValidInput(input);

  const warnings: string[] = [];
  const wicketType = normalizeWicketType(input, warnings);
  const wicketAdd = input.wicket.happened && wicketType !== "NONE";

  let legalDelivery = true;
  let batterRunsAdd = 0;
  let teamRunsAdd = 0;
  let rotationRuns = 0;
  let extrasAdd = { wd: 0, nb: 0, b: 0, lb: 0 };
  let bowlerRunsConcededAdd = 0;

  if (input.extraType === "WD") {
    legalDelivery = false;
    teamRunsAdd = 1 + input.additionalRuns;
    rotationRuns = input.additionalRuns;
    extrasAdd = { wd: teamRunsAdd, nb: 0, b: 0, lb: 0 };
    bowlerRunsConcededAdd = teamRunsAdd;
  } else if (input.extraType === "NB") {
    legalDelivery = false;
    teamRunsAdd = 1 + input.runsOffBat + input.additionalRuns;
    rotationRuns = input.runsOffBat + input.additionalRuns;
    batterRunsAdd = input.runsOffBat;
    extrasAdd = { wd: 0, nb: 1 + input.additionalRuns, b: 0, lb: 0 };
    bowlerRunsConcededAdd = teamRunsAdd;
  } else if (input.extraType === "B") {
    legalDelivery = true;
    teamRunsAdd = input.additionalRuns;
    rotationRuns = input.additionalRuns;
    extrasAdd = { wd: 0, nb: 0, b: input.additionalRuns, lb: 0 };
    bowlerRunsConcededAdd = 0;
  } else if (input.extraType === "LB") {
    legalDelivery = true;
    teamRunsAdd = input.additionalRuns;
    rotationRuns = input.additionalRuns;
    extrasAdd = { wd: 0, nb: 0, b: 0, lb: input.additionalRuns };
    bowlerRunsConcededAdd = 0;
  } else {
    legalDelivery = true;
    teamRunsAdd = input.runsOffBat;
    rotationRuns = input.runsOffBat;
    batterRunsAdd = input.runsOffBat;
    bowlerRunsConcededAdd = input.runsOffBat;
  }

  let nextStrikerId = input.strikerId;
  let nextNonStrikerId = input.nonStrikerId;
  const rotated = rotateForRuns(nextStrikerId, nextNonStrikerId, rotationRuns);
  nextStrikerId = rotated.strikerId;
  nextNonStrikerId = rotated.nonStrikerId;

  let dismissalRecorded: DismissalRecorded | undefined;
  if (wicketAdd) {
    const outId =
      input.wicket.playerOutId ??
      (input.wicket.isStrikerOut === false ? input.nonStrikerId : input.strikerId);
    const isStrikerOut = outId === nextStrikerId;
    dismissalRecorded = {
      type: wicketType,
      playerOutId: outId,
      isStrikerOut,
    };
    if (outId === nextStrikerId) {
      nextStrikerId = NEW_BATTER_PLACEHOLDER;
    } else if (outId === nextNonStrikerId) {
      nextNonStrikerId = NEW_BATTER_PLACEHOLDER;
    }
  }

  const legalBallsAfter = matchState.legalBalls + (legalDelivery ? 1 : 0);
  const overCompleted = legalDelivery && legalBallsAfter % matchState.ballsPerOver === 0;
  if (overCompleted) {
    const temp = nextStrikerId;
    nextStrikerId = nextNonStrikerId;
    nextNonStrikerId = temp;
  }

  return {
    legalDelivery,
    teamRunsAdd,
    batterRunsAdd,
    extrasAdd,
    bowlerRunsConcededAdd,
    wicketAdd,
    dismissalRecorded,
    nextStrikerId,
    nextNonStrikerId,
    overCompleted,
    warnings,
  };
};

export const applyBall = (matchState: MatchState, input: BallEventInput): MatchState => {
  const previousState = snapshotState(matchState);
  const result = computeBallResult(input, matchState);
  const next = snapshotState(matchState);

  next.totalRuns += result.teamRunsAdd;
  next.wickets += result.wicketAdd ? 1 : 0;
  next.legalBalls += result.legalDelivery ? 1 : 0;
  next.extras = {
    wd: next.extras.wd + result.extrasAdd.wd,
    nb: next.extras.nb + result.extrasAdd.nb,
    b: next.extras.b + result.extrasAdd.b,
    lb: next.extras.lb + result.extrasAdd.lb,
  };
  next.strikerId = result.nextStrikerId;
  next.nonStrikerId = result.nextNonStrikerId;
  next.bowlerId = input.bowlerId;

  const strikerRow = ensureBatter(next as MatchState, input.strikerId);
  strikerRow.runs += result.batterRunsAdd;
  const facedBall =
    result.legalDelivery || (input.extraType === "NB" && input.runsOffBat > 0);
  if (facedBall) {
    strikerRow.balls += 1;
  }

  if (result.dismissalRecorded?.playerOutId) {
    const outRow = ensureBatter(next as MatchState, result.dismissalRecorded.playerOutId);
    outRow.out = true;
  }

  const bowlerRow = ensureBowler(next as MatchState, input.bowlerId);
  bowlerRow.runsConceded += result.bowlerRunsConcededAdd;
  if (result.legalDelivery) {
    bowlerRow.balls += 1;
  }
  if (
    result.wicketAdd &&
    result.dismissalRecorded &&
    BOWLER_WICKET_TYPES.has(result.dismissalRecorded.type)
  ) {
    bowlerRow.wickets += 1;
  }

  next.overs = formatOvers(next.legalBalls, next.ballsPerOver);
  next.currentRunRate = calcRunRate(next.totalRuns, next.legalBalls, next.ballsPerOver);

  return {
    ...next,
    batterStats: next.batterStats,
    bowlerStats: next.bowlerStats,
    ballFeed: [
      ...matchState.ballFeed,
      {
        input,
        result,
        previousState,
      },
    ],
  };
};

export const undoLastBall = (matchState: MatchState): MatchState => {
  const last = matchState.ballFeed.at(-1);
  if (!last) {
    return matchState;
  }
  return {
    ...last.previousState,
    ballFeed: matchState.ballFeed.slice(0, -1),
  };
};

export const createInitialMatchState = (
  seed: Pick<
    MatchState,
    "ballsPerOver" | "strikerId" | "nonStrikerId" | "bowlerId"
  >,
): MatchState => ({
  ballsPerOver: seed.ballsPerOver,
  strikerId: seed.strikerId,
  nonStrikerId: seed.nonStrikerId,
  bowlerId: seed.bowlerId,
  totalRuns: 0,
  wickets: 0,
  legalBalls: 0,
  extras: { wd: 0, nb: 0, b: 0, lb: 0 },
  currentRunRate: 0,
  overs: "0.0",
  batterStats: {},
  bowlerStats: {},
  ballFeed: [],
});

export const createBallInput = (
  state: MatchState,
  patch: Partial<BallEventInput>,
): BallEventInput => {
  const ballInOverIndex = state.legalBalls % state.ballsPerOver;
  return {
    strikerId: state.strikerId,
    nonStrikerId: state.nonStrikerId,
    bowlerId: state.bowlerId,
    overNumber: Math.floor(state.legalBalls / state.ballsPerOver) + 1,
    ballInOverIndex,
    extraType: "NONE",
    boundary: "NONE",
    ...patch,
    runsOffBat: clampRun(patch.runsOffBat ?? 0),
    additionalRuns: clampRun(patch.additionalRuns ?? 0),
    wicket: {
      happened: patch.wicket?.happened ?? false,
      type: patch.wicket?.type ?? "NONE",
      playerOutId: patch.wicket?.playerOutId,
      isStrikerOut: patch.wicket?.isStrikerOut,
    },
  };
};
