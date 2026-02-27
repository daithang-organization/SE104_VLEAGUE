import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RequestPerformance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    const startTime = Date.now();

    this.logger.debug(
      `➡️  [${method}] ${url} → ${controllerName}.${handlerName}()`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusColor =
            duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴';

          this.logger.log(
            `⬅️  [${method}] ${url} ${statusColor} ${duration}ms`,
          );

          // Add Server-Timing header for browser DevTools / monitoring
          response.setHeader(
            'Server-Timing',
            `app;dur=${duration};desc="${controllerName}.${handlerName}"`,
          );

          // Log response data size trong dev mode
          if (process.env.NODE_ENV === 'development' && data) {
            const responseSize = JSON.stringify(data).length;
            if (responseSize > 1000) {
              this.logger.debug(
                `📊 Response size: ${(responseSize / 1024).toFixed(2)} KB`,
              );
            }
          }
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `❌ [${method}] ${url} failed after ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
