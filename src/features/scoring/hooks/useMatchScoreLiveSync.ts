import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";
import type { MatchScoreResponse } from "../types/scoring.types";

type ScoreRefreshEvent = {
  matchId: string;
  ts: number;
};

type ScoreUpdateEvent = {
  matchId: string;
  score: MatchScoreResponse;
  ts: number;
};

let sharedSocket: Socket | null = null;

const resolveSocketUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  if (!configuredBaseUrl && typeof window !== "undefined") {
    return window.location.origin;
  }

  try {
    const parsed = new URL(configuredBaseUrl, window.location.origin);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return configuredBaseUrl;
  }
};

export const useMatchScoreLiveSync = (matchId: string, enabled = true) => {
  const queryClient = useQueryClient();
  const socketUrl = useMemo(() => resolveSocketUrl(), []);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !matchId) {
      return;
    }

    if (!sharedSocket) {
      sharedSocket = io(socketUrl, {
        path: "/socket.io",
        withCredentials: true,
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        reconnectionDelayMax: 2000,
        autoConnect: true,
      });
    }

    const socket = sharedSocket;

    const subscribe = () => {
      socket.emit("match:subscribe", { matchId });
    };

    const handleConnect = () => {
      subscribe();
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleScoreRefresh = (event: ScoreRefreshEvent) => {
      if (!event?.matchId || event.matchId !== matchId) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: scoringQueryKeys.score(matchId),
      });
    };

    const handleScoreUpdate = (event: ScoreUpdateEvent) => {
      if (!event?.matchId || event.matchId !== matchId || !event.score) {
        return;
      }
      queryClient.setQueryData(scoringQueryKeys.score(matchId), event.score);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("score:refresh", handleScoreRefresh);
    socket.on("score:update", handleScoreUpdate);

    return () => {
      socket.emit("match:unsubscribe", { matchId });
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("score:refresh", handleScoreRefresh);
      socket.off("score:update", handleScoreUpdate);
    };
  }, [enabled, matchId, queryClient, socketUrl]);

  return { isConnected };
};
