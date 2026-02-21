import { describe, expect, it } from "vitest";
import type { MatchItem } from "../types/fixtures.types";
import { canEditRoster, canGenerateFixtures, getGenerateFixturesErrorMessage, mapMatchTeams } from "./fixturesView";

describe("mapMatchTeams", () => {
  it("maps teamAId/teamBId to names from tournament teams", () => {
    const matches: MatchItem[] = [
      {
        id: "m1",
        tournamentId: "t1",
        teamAId: "ta",
        teamBId: "tb",
        stage: "LEAGUE",
        teamA: { id: "ta", name: "TBD" },
        teamB: { id: "tb", name: "TBD" },
        status: "SCHEDULED",
      },
    ];

    const result = mapMatchTeams(matches, [
      { id: "ta", tournamentId: "t1", name: "Team Alpha", createdAt: "" },
      { id: "tb", tournamentId: "t1", name: "Team Bravo", createdAt: "" },
    ]);

    expect(result[0].teamA.name).toBe("Team Alpha");
    expect(result[0].teamB?.name).toBe("Team Bravo");
  });
});

describe("getGenerateFixturesErrorMessage", () => {
  it("returns a conflict message for 409", () => {
    expect(getGenerateFixturesErrorMessage(409)).toBe("Fixtures already generated.");
  });

  it("returns forbidden message for 403", () => {
    expect(getGenerateFixturesErrorMessage(403)).toBe(
      "You do not have permission to generate fixtures.",
    );
  });
});

describe("action visibility", () => {
  it("shows generate when fixture.generate permission exists", () => {
    expect(canGenerateFixtures(["fixture.generate"])).toBe(true);
    expect(canGenerateFixtures(["score.write"])).toBe(false);
  });

  it("shows roster edit when roster.manage permission exists", () => {
    expect(canEditRoster(["roster.manage"])).toBe(true);
    expect(canEditRoster(["match.start"])).toBe(false);
  });
});
