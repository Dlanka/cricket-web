import { describe, expect, it } from "vitest";
import type { MatchScoreResponse } from "../../scoring/types/scoring.types";
import { mergeScoreSnapshot } from "./useSubmitScoreEventMutation";

const baseScore: MatchScoreResponse = {
  matchId: "m1",
  inningsId: "inn-1",
  inningsNumber: 1,
  inningsCompleted: false,
  battingTeam: { id: "t1", name: "Team 1", shortName: "T1" },
  bowlingTeam: { id: "t2", name: "Team 2", shortName: "T2" },
  score: {
    runs: 10,
    wickets: 1,
    balls: 12,
    overs: "2.0",
    extras: 1,
    wides: 1,
    noBalls: 0,
    byes: 0,
    legByes: 0,
  },
  current: {
    strikerId: "p1",
    nonStrikerId: "p2",
    bowlerId: "b1",
  },
  lastEvent: { id: "e1", seq: 1, type: "run" },
  settings: { ballsPerOver: 6, oversPerInnings: 20 },
};

describe("mergeScoreSnapshot", () => {
  it("uses backend current players/bowler as source of truth", () => {
    const merged = mergeScoreSnapshot(baseScore, {
      inningsId: "inn-1",
      inningsCompleted: false,
      score: {
        runs: 11,
        wickets: 1,
        balls: 13,
        overs: "2.1",
        extras: 1,
        wides: 1,
        noBalls: 0,
        byes: 0,
        legByes: 0,
      },
      current: {
        strikerId: "p2",
        nonStrikerId: "p3",
        bowlerId: "b1",
      },
      event: { id: "e2", seq: 2, type: "run" },
    });

    expect(merged?.current).toEqual({
      strikerId: "p2",
      nonStrikerId: "p3",
      bowlerId: "b1",
    });
  });

  it("updates lastEvent from backend response", () => {
    const merged = mergeScoreSnapshot(baseScore, {
      inningsId: "inn-1",
      inningsCompleted: false,
      score: baseScore.score,
      current: baseScore.current,
      event: { id: "e9", seq: 9, type: "undo" },
    });

    expect(merged?.lastEvent).toEqual({ id: "e9", seq: 9, type: "undo" });
  });

  it("returns undefined when previous cache is missing", () => {
    const merged = mergeScoreSnapshot(undefined, {
      inningsId: "inn-1",
      inningsCompleted: false,
      score: baseScore.score,
      current: baseScore.current,
      event: { id: "e2", seq: 2, type: "run" },
    });

    expect(merged).toBeUndefined();
  });
});

