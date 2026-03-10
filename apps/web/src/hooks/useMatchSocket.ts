import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../lib/api';

const WS_URL = SERVER_URL;

interface MatchEvent {
  matchId: string;
  event: Record<string, unknown>;
  timestamp: string;
}

interface ScoreUpdate {
  matchId: string;
  homeScore: number | null;
  awayScore: number | null;
  timestamp: string;
}

interface StatusChange {
  matchId: string;
  status: string;
  homeTeam?: unknown;
  awayTeam?: unknown;
  timestamp: string;
}

interface UseMatchSocketOptions {
  matchId?: string;
  onMatchEvent?: (data: MatchEvent) => void;
  onScoreUpdate?: (data: ScoreUpdate) => void;
  onStatusChange?: (data: StatusChange) => void;
}

/**
 * React hook for real-time match updates via WebSocket.
 *
 * Usage:
 * ```tsx
 * const { isConnected } = useMatchSocket({
 *   matchId: match.id,
 *   onMatchEvent: (data) => { refetchEvents(); },
 *   onScoreUpdate: (data) => { setScore(data); },
 *   onStatusChange: (data) => { refetchMatch(); },
 * });
 * ```
 */
export function useMatchSocket({
  matchId,
  onMatchEvent,
  onScoreUpdate,
  onStatusChange,
}: UseMatchSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Store callbacks in refs to avoid reconnection on callback change
  const onMatchEventRef = useRef(onMatchEvent);
  const onScoreUpdateRef = useRef(onScoreUpdate);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onMatchEventRef.current = onMatchEvent;
  }, [onMatchEvent]);
  useEffect(() => {
    onScoreUpdateRef.current = onScoreUpdate;
  }, [onScoreUpdate]);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    const socket = io(`${WS_URL}/matches`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (matchId) {
        socket.emit('joinMatch', matchId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('matchEvent', (data: MatchEvent) => {
      onMatchEventRef.current?.(data);
    });

    socket.on('scoreUpdate', (data: ScoreUpdate) => {
      onScoreUpdateRef.current?.(data);
    });

    socket.on('matchStatusChanged', (data: StatusChange) => {
      onStatusChangeRef.current?.(data);
    });

    return () => {
      if (matchId) {
        socket.emit('leaveMatch', matchId);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [matchId]);

  const joinMatch = useCallback((id: string) => {
    socketRef.current?.emit('joinMatch', id);
  }, []);

  const leaveMatch = useCallback((id: string) => {
    socketRef.current?.emit('leaveMatch', id);
  }, []);

  return { isConnected, joinMatch, leaveMatch };
}
