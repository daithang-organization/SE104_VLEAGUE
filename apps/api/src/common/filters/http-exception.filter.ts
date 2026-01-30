import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  timestamp?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: 'Đã xảy ra lỗi không mong muốn',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;

        // If already has our error shape {code, message}
        if (resp.code && resp.message) {
          errorResponse = {
            code: resp.code as string,
            message: resp.message as string,
            details: resp.details,
          };
        }
        // Validation errors from class-validator
        else if (Array.isArray(resp.message)) {
          errorResponse = {
            code: 'VALIDATION_ERROR',
            message: 'Dữ liệu không hợp lệ',
            details: resp.message,
          };
        }
        // Generic HttpException
        else {
          errorResponse = {
            code: this.getErrorCode(status),
            message: (resp.message as string) || exception.message,
          };
        }
      } else {
        errorResponse = {
          code: this.getErrorCode(status),
          message: String(exceptionResponse),
        };
      }
    } else if (exception instanceof Error) {
      // Log internal errors với stack trace
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );

      errorResponse = {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'development'
            ? exception.message
            : 'Đã xảy ra lỗi không mong muốn',
      };
    }

    // Thêm metadata cho response
    const requestId = request.headers['x-request-id'] as string;
    errorResponse.requestId = requestId;
    errorResponse.timestamp = new Date().toISOString();

    // Log error với context
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status} - ${errorResponse.code}: ${errorResponse.message}`,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status} - ${errorResponse.code}: ${errorResponse.message}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_ERROR',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}
