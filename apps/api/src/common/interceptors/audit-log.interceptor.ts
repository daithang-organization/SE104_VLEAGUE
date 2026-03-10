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

    // Capture old value for UPDATE and DELETE operations
    const oldValuePromise =
      (method === 'PATCH' || method === 'PUT' || method === 'DELETE') &&
      entityId
        ? this.fetchOldValue(entity, entityId)
        : Promise.resolve(undefined);

    return new Observable((subscriber) => {
      oldValuePromise
        .then((oldValue) => {
          next
            .handle()
            .pipe(
              tap({
                next: (responseBody) => {
                  this.prisma.auditLog
                    .create({
                      data: {
                        userId: user?.id,
                        userEmail: user?.email,
                        action,
                        entity,
                        entityId:
                          entityId ?? this.extractIdFromResponse(responseBody),
                        oldValue: oldValue
                          ? JSON.stringify(oldValue).substring(0, 2000)
                          : undefined,
                        newValue: body
                          ? JSON.stringify(body).substring(0, 2000)
                          : undefined,
                        ipAddress: request.ip ?? undefined,
                        userAgent: request.headers['user-agent']?.substring(
                          0,
                          500,
                        ),
                      },
                    })
                    .catch((err: unknown) => {
                      this.logger.error('Failed to save audit log', err);
                    });
                },
              }),
            )
            .subscribe(subscriber);
        })
        .catch(() => {
          next.handle().subscribe(subscriber);
        });
    });
  }

  /**
   * Attempt to fetch old value of the entity before update/delete.
   */
  private async fetchOldValue(
    entity: string,
    entityId: string,
  ): Promise<Record<string, unknown> | undefined> {
    try {
      const modelName = this.getModelName(entity);
      if (!modelName) return undefined;
      const model = (this.prisma as Record<string, unknown>)[
        modelName
      ] as Record<string, (...args: unknown[]) => unknown>;
      if (!model?.findUnique) return undefined;
      return (await model.findUnique({ where: { id: entityId } })) as
        | Record<string, unknown>
        | undefined;
    } catch {
      return undefined;
    }
  }

  private getModelName(entity: string): string | undefined {
    const map: Record<string, string> = {
      teams: 'team',
      players: 'player',
      matches: 'match',
      seasons: 'season',
      stadiums: 'stadium',
      users: 'user',
      regulations: 'regulation',
    };
    return map[entity];
  }

  private getAction(method: string, pathParts: string[]): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PATCH':
      case 'PUT':
        if (pathParts.includes('status')) return 'STATUS_CHANGE';
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
}
