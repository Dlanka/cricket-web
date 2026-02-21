import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/services/axios";
import { getMatch, startMatch } from "./matches.service";

vi.mock("../../../shared/services/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("matches.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes match detail response", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        ok: true,
        data: {
          _id: "match-1",
          tournamentId: "tour-1",
          teams: {
            teamA: { _id: "ta", name: "Team A" },
            teamB: { _id: "tb", name: "Team B" },
          },
          oversPerInnings: 20,
          ballsPerOver: 6,
          status: "SCHEDULED",
          stage: "LEAGUE",
        },
      },
    });

    const result = await getMatch("match-1");

    expect(result.matchId).toBe("match-1");
    expect(result.teams.teamA.name).toBe("Team A");
    expect(result.teams.teamB?.id).toBe("tb");
  });

  it("submits start payload and unwraps response", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        ok: true,
        data: {
          matchId: "match-1",
          inningsId: "inn-1",
          status: "LIVE",
        },
      },
    });

    const result = await startMatch("match-1", {
      battingTeamId: "ta",
      bowlingTeamId: "tb",
      strikerId: "p1",
      nonStrikerId: "p2",
      bowlerId: "p9",
    });

    expect(api.post).toHaveBeenCalledWith("/matches/match-1/start", {
      battingTeamId: "ta",
      bowlingTeamId: "tb",
      strikerId: "p1",
      nonStrikerId: "p2",
      bowlerId: "p9",
    });
    expect(result.status).toBe("LIVE");
  });
});
