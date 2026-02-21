import { describe, expect, it } from "vitest";
import { startMatchSchema } from "./startMatchSchema";

describe("startMatchSchema", () => {
  it("rejects when striker and non-striker are the same", () => {
    const result = startMatchSchema.safeParse({
      battingTeamId: "team-a",
      strikerId: "p1",
      nonStrikerId: "p1",
      bowlerId: "p9",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid opening selections", () => {
    const result = startMatchSchema.safeParse({
      battingTeamId: "team-a",
      strikerId: "p1",
      nonStrikerId: "p2",
      bowlerId: "p9",
    });

    expect(result.success).toBe(true);
  });
});
