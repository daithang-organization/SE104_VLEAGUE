import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/live',
})
export class LiveGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LiveGateway.name);

  afterInit() {
    this.logger.log('WebSocket Live Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  /** Emit a match event to all connected clients */
  emitMatchEvent(
    matchId: string,
    event: {
      type: string;
      minute: number;
      playerName?: string;
      teamName?: string;
      homeScore?: number;
      awayScore?: number;
    },
  ) {
    this.server.emit('match:event', { matchId, ...event });
    this.logger.log(
      `Emitted match:event for match ${matchId} — ${event.type} at ${event.minute}'`,
    );
  }

  /** Emit score update */
  emitScoreUpdate(matchId: string, homeScore: number, awayScore: number) {
    this.server.emit('match:score', { matchId, homeScore, awayScore });
  }

  /** Emit match status change */
  emitStatusChange(matchId: string, status: string) {
    this.server.emit('match:status', { matchId, status });
  }

  /** Emit schedule published */
  emitSchedulePublished(seasonId: string) {
    this.server.emit('schedule:published', { seasonId });
  }

  /** Generic notification broadcast */
  emitNotification(data: { title: string; message: string; link?: string }) {
    this.server.emit('notification', data);
  }
}
