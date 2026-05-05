import { describe, expect, it } from "vitest";
import {
  applyRosterToggle,
  getSelectionError,
  mapRosterErrorMessage,
  uniqueIds,
} from "@/features/roster/utils/rosterForm";

describe("rosterForm helpers", () => {
  it("returns validation error when no players selected", () => {
    expect(getSelectionError(0)).toBe("Select at least 1 player.");
  });

  it("allows selecting more than 11 players", () => {
    const state = {
      playingIds: Array.from({ length: 12 }, (_, index) => `p${index}`),
      captainId: "p0",
      keeperId: "p1",
    };

    const next = applyRosterToggle(state, "p12");

    expect(next.playingIds).toHaveLength(13);
    expect(next.playingIds).toContain("p12");
  });

  it("auto-clears captain/keeper when unselected", () => {
    const state = {
      playingIds: ["p1", "p2", "p3"],
      captainId: "p2",
      keeperId: "p2",
    };

    const next = applyRosterToggle(state, "p2");

    expect(next.playingIds).toEqual(["p1", "p3"]);
    expect(next.captainId).toBeUndefined();
    expect(next.keeperId).toBeUndefined();
  });

  it("maps backend roster size code to user message", () => {
    const error = {
      message: "Validation failed",
      details: { error: { code: "match.roster_size_invalid" } },
    };

    expect(mapRosterErrorMessage(error, "fallback")).toBe(
      "Roster must contain at least 1 player.",
    );
  });

  it("maps backend invalid state code", () => {
    const error = {
      message: "Validation failed",
      details: { error: { code: "match.invalid_state" } },
    };

    expect(mapRosterErrorMessage(error, "fallback")).toBe(
      "This match cannot be updated in the current state.",
    );
  });

  it("removes duplicate player ids before submit payload", () => {
    expect(uniqueIds(["p1", "p2", "p1", "p2", "p3"])).toEqual([
      "p1",
      "p2",
      "p3",
    ]);
  });
});
