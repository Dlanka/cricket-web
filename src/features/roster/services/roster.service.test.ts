import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRoster, setRoster } from "./roster.service";
import { api } from "@/shared/services/axios";

vi.mock("../../../shared/services/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("roster.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits roster for team A and team B", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true, data: { count: 11 } } });

    await setRoster("match-1", {
      teamId: "team-a",
      playingPlayerIds: ["p1", "p2"],
      captainId: "p1",
    });
    await setRoster("match-1", {
      teamId: "team-b",
      playingPlayerIds: ["p9", "p10"],
      keeperId: "p9",
    });

    expect(api.post).toHaveBeenNthCalledWith(
      1,
      "/matches/match-1/roster",
      expect.objectContaining({ teamId: "team-a" }),
    );
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      "/matches/match-1/roster",
      expect.objectContaining({ teamId: "team-b" }),
    );
  });

  it("normalizes keyed roster payload", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        ok: true,
        data: {
          matchId: "match-1",
          teams: {
            "team-a": [{ playerId: "p1", isPlaying: true }],
          },
        },
      },
    });

    const result = await getRoster("match-1");

    expect(result.teams).toEqual([
      { teamId: "team-a", players: [{ playerId: "p1", isPlaying: true }] },
    ]);
  });

  it("normalizes grouped payload without teams wrapper", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        ok: true,
        data: {
          "team-a": [{ playerId: "p1", isPlaying: true }],
          "team-b": [{ playerId: "p9", isPlaying: true, isCaptain: true }],
        },
      },
    });

    const result = await getRoster("match-1");

    expect(result.teams).toEqual([
      { teamId: "team-a", players: [{ playerId: "p1", isPlaying: true }] },
      {
        teamId: "team-b",
        players: [{ playerId: "p9", isPlaying: true, isCaptain: true }],
      },
    ]);
  });

  it("throws mapped error when envelope is ok false", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        ok: false,
        error: {
          code: "match.roster_size_invalid",
          message: "At most 11 players can be selected.",
        },
      },
    });

    await expect(
      setRoster("match-1", {
        teamId: "team-a",
        playingPlayerIds: Array.from({ length: 12 }, (_, index) => `p${index}`),
      }),
    ).rejects.toMatchObject({
      message: "At most 11 players can be selected.",
      details: {
        error: {
          code: "match.roster_size_invalid",
        },
      },
    });
  });
});
