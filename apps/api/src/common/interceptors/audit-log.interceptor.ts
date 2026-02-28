import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

/** Methods that should be audited */
const AUDIT_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = request.method;

    if (!AUDIT_METHODS.has(method)) {
      return next.handle();
    }

    const user = request.user;
    const url: string = request.url;
    const body = request.body as Record<string, unknown> | undefined;

    // Extract entity from URL: /api/teams/uuid → teams
    const pathParts = url
      .replace(/^\/api\//, '')
      .split('/')
      .filter(Boolean);
    const entity = pathParts[0] ?? 'unknown';
    const entityId =
      pathParts[1] && this.isUuid(pathParts[1]) ? pathParts[1] : undefined;

    // Determine action
    const action = this.getAction(method, pathParts);

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          this.saveLog({
            userId: user?.id,
            userEmail: user?.email,
            action,
            entity,
            entityId: entityId ?? this.extractIdFromResponse(responseBody),
            newValue: body
              ? JSON.stringify(body).substring(0, 2000)
              : undefined,
            ipAddress: request.ip ?? undefined,
            userAgent: request.headers['user-agent']?.substring(0, 500),
          }).catch((err: unknown) => {
            this.logger.error('Failed to save audit log', err);
          });
        },
      }),
    );
  }

  private getAction(method: string, pathParts: string[]): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PATCH':
      case 'PUT':
        // Check for status changes
        if (pathParts.includes('status')) return 'STATUS_CHANGE';
        if (pathParts.includes('read') || pathParts.includes('read-all'))
          return 'UPDATE';
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return method;
    }
  }

  private isUuid(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      str,
    );
  }

  private extractIdFromResponse(body: unknown): string | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const obj = body as Record<string, unknown>;
    if (typeof obj.id === 'string') return obj.id;
    return undefined;
  }

  private async saveLog(data: {
    userId?: string;
    userEmail?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await (
      this.prisma as unknown as Record<
        string,
        { create: (args: unknown) => Promise<unknown> }
      >
    )['auditLog'].create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldValue: data.oldValue,
        newValue: data.newValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}
