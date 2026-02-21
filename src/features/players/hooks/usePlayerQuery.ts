import { useQuery } from "@tanstack/react-query";
import { fetchPlayer } from "../services/players.service";

export const usePlayerQuery = (playerId: string) =>
  useQuery({
    queryKey: ["player", playerId],
    queryFn: () => fetchPlayer(playerId),
    enabled: Boolean(playerId),
  });
