import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket Gateway for real-time match updates.
 *
 * Namespace: /matches
 * Events emitted:
 *   - matchEvent    → new event added (goal, card, sub)
 *   - scoreUpdate   → score recalculated
 *   - matchStatusChanged → match status transition
 *
 * Client messages:
 *   - joinMatch(matchId)  → subscribe to a specific match room
 *   - leaveMatch(matchId) → unsubscribe from a match room
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/matches',
})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MatchGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinMatch')
  handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    const room = `match:${matchId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joinedMatch', data: { matchId } };
  }

  @SubscribeMessage('leaveMatch')
  handleLeaveMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    const room = `match:${matchId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'leftMatch', data: { matchId } };
  }

  /** Emit when a new match event is added (goal, card, sub) */
  emitMatchEvent(matchId: string, event: Record<string, unknown>) {
    this.server.to(`match:${matchId}`).emit('matchEvent', {
      matchId,
      event,
      timestamp: new Date().toISOString(),
    });
  }

  /** Emit when match scores are recalculated */
  emitScoreUpdate(
    matchId: string,
    data: { homeScore: number | null; awayScore: number | null },
  ) {
    this.server.to(`match:${matchId}`).emit('scoreUpdate', {
      matchId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /** Emit to all clients when a match status changes */
  emitStatusChange(
    matchId: string,
    data: { status: string; homeTeam?: unknown; awayTeam?: unknown },
  ) {
    this.server.emit('matchStatusChanged', {
      matchId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}
