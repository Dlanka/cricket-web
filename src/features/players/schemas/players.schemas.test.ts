import { describe, expect, it } from "vitest";
import { playerCreateSchema, playerUpdateSchema } from "./players.schemas";

describe("player style enum validation", () => {
  it("accepts empty optional style fields", () => {
    const result = playerCreateSchema.safeParse({
      fullName: "Test Player",
      jerseyNumber: 12,
      isWicketKeeper: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid enum values", () => {
    const result = playerCreateSchema.safeParse({
      fullName: "Test Player",
      battingStyle: "RIGHT_HAND_BAT",
      bowlingStyle: "LEFT_ARM_ORTHODOX",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid style values", () => {
    const result = playerCreateSchema.safeParse({
      fullName: "Test Player",
      battingStyle: "RHB",
      bowlingStyle: "OFF_SPIN",
    });
    expect(result.success).toBe(false);
  });

  it("allows partial update with enum values", () => {
    const result = playerUpdateSchema.safeParse({
      bowlingStyle: "RIGHT_ARM_FAST_MEDIUM",
    });
    expect(result.success).toBe(true);
  });
});
