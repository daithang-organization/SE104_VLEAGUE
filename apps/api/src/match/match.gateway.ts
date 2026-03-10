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
  pingInterval: 25000,
  pingTimeout: 10000,
})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MatchGateway.name);
  private readonly roomViewers = new Map<string, number>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', {
      message: 'Kết nối WebSocket thành công',
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up room viewer counts
    for (const [room] of this.roomViewers) {
      if (this.server) {
        this.updateViewerCount(room);
      }
    }
  }

  @SubscribeMessage('joinMatch')
  handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    const room = `match:${matchId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    this.updateViewerCount(room);
    return {
      event: 'joinedMatch',
      data: { matchId, viewers: this.roomViewers.get(room) ?? 1 },
    };
  }

  @SubscribeMessage('leaveMatch')
  handleLeaveMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    const room = `match:${matchId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    this.updateViewerCount(room);
    return { event: 'leftMatch', data: { matchId } };
  }

  private updateViewerCount(room: string) {
    const roomObj = this.server?.sockets?.adapter?.rooms?.get(room);
    const count = roomObj?.size ?? 0;
    this.roomViewers.set(room, count);
    this.server.to(room).emit('viewerCount', { room, viewers: count });
    if (count === 0) this.roomViewers.delete(room);
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
