import { describe, expect, it } from "vitest";
import { formatMatchOutcome } from "@/features/matches/utils/formatMatchOutcome";

describe("formatMatchOutcome", () => {
  it("formats wickets + balls left", () => {
    const formatted = formatMatchOutcome({
      outcome: "WIN",
      winnerTeamName: "SA",
      winByWickets: 6,
      ballsLeft: 40,
    });

    expect(formatted.badge).toBe("WIN");
    expect(formatted.text).toBe("SA won by 6 wickets (40 balls left)");
  });

  it("formats wickets win without balls left", () => {
    const formatted = formatMatchOutcome({
      outcome: "WIN",
      winnerTeamName: "SA",
      winByWickets: 1,
    });

    expect(formatted.text).toBe("SA won by 1 wicket");
  });

  it("formats runs win", () => {
    const formatted = formatMatchOutcome({
      outcome: "WIN",
      winnerTeamName: "UAE",
      winByRuns: 12,
    });

    expect(formatted.text).toBe("UAE won by 12 runs");
  });

  it("formats tie", () => {
    const formatted = formatMatchOutcome({ outcome: "TIE" });
    expect(formatted.badge).toBe("TIE");
    expect(formatted.text).toBe("Match tied");
  });

  it("formats no result", () => {
    const formatted = formatMatchOutcome({ outcome: "NO_RESULT" });
    expect(formatted.badge).toBe("NO RESULT");
    expect(formatted.text).toBe("No result");
  });

  it("formats pending", () => {
    const formatted = formatMatchOutcome({ outcome: null });
    expect(formatted.badge).toBe("PENDING");
    expect(formatted.text).toBe("Result pending");
  });
});

