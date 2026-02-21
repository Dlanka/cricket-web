import { describe, expect, it } from "vitest";
import { setRosterSchema } from "./roster.schemas";

describe("setRosterSchema", () => {
  it("accepts valid payload", () => {
    const result = setRosterSchema.safeParse({
      teamId: "team-1",
      playingPlayerIds: ["p1", "p2"],
      captainId: "p1",
      keeperId: "p2",
    });

    expect(result.success).toBe(true);
  });

  it("rejects captain outside playing players", () => {
    const result = setRosterSchema.safeParse({
      teamId: "team-1",
      playingPlayerIds: ["p1", "p2"],
      captainId: "p3",
    });

    expect(result.success).toBe(false);
  });

  it("rejects keeper outside playing players", () => {
    const result = setRosterSchema.safeParse({
      teamId: "team-2",
      playingPlayerIds: ["p9", "p10"],
      keeperId: "p11",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty playing players", () => {
    const result = setRosterSchema.safeParse({
      teamId: "team-2",
      playingPlayerIds: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects more than 11 playing players", () => {
    const result = setRosterSchema.safeParse({
      teamId: "team-3",
      playingPlayerIds: Array.from({ length: 12 }, (_, index) => `p${index}`),
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid player count between 1 and 11", () => {
    const result = setRosterSchema.safeParse({
      teamId: "team-4",
      playingPlayerIds: ["p1"],
    });

    expect(result.success).toBe(true);
  });
});
