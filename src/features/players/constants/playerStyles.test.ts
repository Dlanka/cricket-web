import { describe, expect, it } from "vitest";
import {
  BATTING_STYLE_OPTIONS,
  BOWLING_STYLE_OPTIONS,
  getBattingStyleLabel,
  getBowlingStyleLabel,
} from "@/features/players/constants/playerStyles";

describe("player style options", () => {
  it("contains batting dropdown options", () => {
    expect(BATTING_STYLE_OPTIONS).toEqual(
      expect.arrayContaining([
        { value: "RIGHT_HAND_BAT", label: "Right-hand bat" },
        { value: "LEFT_HAND_BAT", label: "Left-hand bat" },
      ]),
    );
  });

  it("contains bowling dropdown options", () => {
    expect(BOWLING_STYLE_OPTIONS).toEqual(
      expect.arrayContaining([
        { value: "RIGHT_ARM_FAST", label: "Right-arm fast" },
        { value: "LEFT_ARM_ORTHODOX", label: "Left-arm orthodox" },
      ]),
    );
  });

  it("formats style labels for UI", () => {
    expect(getBattingStyleLabel("RIGHT_HAND_BAT")).toBe("Right-hand bat");
    expect(getBowlingStyleLabel("LEFT_ARM_WRIST_SPIN")).toBe(
      "Left-arm wrist spin",
    );
  });
});
