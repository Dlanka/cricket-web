import { describe, expect, it } from "vitest";
import {
  applyBall,
  computeBallResult,
  createBallInput,
  createInitialMatchState,
  undoLastBall,
  type MatchState,
} from "@/features/scoringPanel/engine/ballScoring";

const createSeedState = () =>
  createInitialMatchState({
    ballsPerOver: 6,
    strikerId: "p1",
    nonStrikerId: "p2",
    bowlerId: "b1",
  });

describe("ballScoring extras rules", () => {
  it("WD only: adds 1 wide, does not consume legal ball, does not rotate strike", () => {
    const state = createSeedState();
    const input = createBallInput(state, { extraType: "WD" });
    const result = computeBallResult(input, state);

    expect(result.legalDelivery).toBe(false);
    expect(result.teamRunsAdd).toBe(1);
    expect(result.extrasAdd.wd).toBe(1);
    expect(result.batterRunsAdd).toBe(0);
    expect(result.nextStrikerId).toBe("p1");
    expect(result.nextNonStrikerId).toBe("p2");
  });

  it("WD + 2 additional: adds 3 wides, rotates strike on odd completed runs only", () => {
    const state = createSeedState();
    const input = createBallInput(state, { extraType: "WD", additionalRuns: 2 });
    const result = computeBallResult(input, state);

    expect(result.teamRunsAdd).toBe(3);
    expect(result.extrasAdd.wd).toBe(3);
    expect(result.nextStrikerId).toBe("p1");
  });

  it("WD + run out: invalid wicket auto-corrects to RUN_OUT", () => {
    const state = createSeedState();
    const input = createBallInput(state, {
      extraType: "WD",
      wicket: { happened: true, type: "CAUGHT" },
    });
    const result = computeBallResult(input, state);

    expect(result.wicketAdd).toBe(true);
    expect(result.dismissalRecorded?.type).toBe("RUN_OUT");
  });

  it("WD + stumped: keeps STUMPED wicket type", () => {
    const state = createSeedState();
    const input = createBallInput(state, {
      extraType: "WD",
      wicket: { happened: true, type: "STUMPED" },
    });
    const result = computeBallResult(input, state);

    expect(result.dismissalRecorded?.type).toBe("STUMPED");
  });

  it("NB only: adds 1 and is illegal delivery", () => {
    const state = createSeedState();
    const input = createBallInput(state, { extraType: "NB" });
    const result = computeBallResult(input, state);

    expect(result.legalDelivery).toBe(false);
    expect(result.teamRunsAdd).toBe(1);
    expect(result.extrasAdd.nb).toBe(1);
  });

  it("NB + 4 off bat totals 5 (1 penalty + 4 bat)", () => {
    const state = createSeedState();
    const input = createBallInput(state, { extraType: "NB", runsOffBat: 4, boundary: "FOUR" });
    const result = computeBallResult(input, state);

    expect(result.teamRunsAdd).toBe(5);
    expect(result.batterRunsAdd).toBe(4);
    expect(result.extrasAdd.nb).toBe(1);
    expect(result.bowlerRunsConcededAdd).toBe(5);
  });

  it("NB + 6 off bat totals 7 (1 penalty + 6 bat)", () => {
    const state = createSeedState();
    const input = createBallInput(state, { extraType: "NB", runsOffBat: 6, boundary: "SIX" });
    const result = computeBallResult(input, state);

    expect(result.teamRunsAdd).toBe(7);
    expect(result.batterRunsAdd).toBe(6);
  });

  it("NB + 2 additional totals 3 with extras credited", () => {
    const state = createSeedState();
    const input = createBallInput(state, { extraType: "NB", additionalRuns: 2 });
    const result = computeBallResult(input, state);

    expect(result.teamRunsAdd).toBe(3);
    expect(result.extrasAdd.nb).toBe(3);
  });

  it("NB + invalid wicket auto-corrects to RUN_OUT", () => {
    const state = createSeedState();
    const input = createBallInput(state, {
      extraType: "NB",
      wicket: { happened: true, type: "LBW" },
    });
    const result = computeBallResult(input, state);

    expect(result.dismissalRecorded?.type).toBe("RUN_OUT");
  });

  it("Bye scores as extras, legal ball, no bowler conceded runs", () => {
    const state = createSeedState();
    const input = createBallInput(state, { extraType: "B", additionalRuns: 4 });
    const result = computeBallResult(input, state);

    expect(result.legalDelivery).toBe(true);
    expect(result.teamRunsAdd).toBe(4);
    expect(result.extrasAdd.b).toBe(4);
    expect(result.batterRunsAdd).toBe(0);
    expect(result.bowlerRunsConcededAdd).toBe(0);
  });

  it("Leg bye scores as extras, legal ball, no bowler conceded runs", () => {
    const state = createSeedState();
    const input = createBallInput(state, { extraType: "LB", additionalRuns: 2 });
    const result = computeBallResult(input, state);

    expect(result.legalDelivery).toBe(true);
    expect(result.teamRunsAdd).toBe(2);
    expect(result.extrasAdd.lb).toBe(2);
    expect(result.batterRunsAdd).toBe(0);
    expect(result.bowlerRunsConcededAdd).toBe(0);
  });
});

describe("ballScoring strike, over and undo", () => {
  it("rotates strike on odd legal runs and keeps on even", () => {
    const state = createSeedState();
    const odd = computeBallResult(createBallInput(state, { runsOffBat: 1 }), state);
    const even = computeBallResult(createBallInput(state, { runsOffBat: 2 }), state);

    expect(odd.nextStrikerId).toBe("p2");
    expect(even.nextStrikerId).toBe("p1");
  });

  it("completes over after 6 legal balls only", () => {
    let state = createSeedState();
    for (let i = 0; i < 5; i += 1) {
      state = applyBall(state, createBallInput(state, { runsOffBat: 0 }));
    }
    state = applyBall(state, createBallInput(state, { extraType: "WD" }));
    expect(state.overs).toBe("0.5");

    const result = computeBallResult(createBallInput(state, { runsOffBat: 0 }), state);
    expect(result.overCompleted).toBe(true);

    state = applyBall(state, createBallInput(state, { runsOffBat: 0 }));
    expect(state.overs).toBe("1.0");
  });

  it("undo restores score, extras, bowler and striker/non-striker state", () => {
    let state = createSeedState();
    state = applyBall(state, createBallInput(state, { extraType: "NB", runsOffBat: 4, boundary: "FOUR" }));
    state = applyBall(state, createBallInput(state, { runsOffBat: 1 }));

    const beforeUndo = state;
    const undone = undoLastBall(state);

    expect(beforeUndo.totalRuns).toBe(6);
    expect(undone.totalRuns).toBe(5);
    expect(undone.extras.nb).toBe(1);
    expect(undone.legalBalls).toBe(0);
    expect(undone.strikerId).toBe("p1");
    expect(undone.nonStrikerId).toBe("p2");
    expect(undone.bowlerStats.b1?.balls ?? 0).toBe(0);
  });

  it("applyBall returns deterministic scoreboard fields for UI", () => {
    let state: MatchState = createSeedState();
    state = applyBall(state, createBallInput(state, { runsOffBat: 4, boundary: "FOUR" }));
    state = applyBall(state, createBallInput(state, { extraType: "B", additionalRuns: 1 }));

    expect(state.totalRuns).toBe(5);
    expect(state.wickets).toBe(0);
    expect(state.overs).toBe("0.2");
    expect(state.currentRunRate).toBeGreaterThan(0);
    expect(state.batterStats.p1?.runs ?? 0).toBe(4);
  });
});
