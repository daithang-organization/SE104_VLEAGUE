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
            message:
              (resp.message as string) ||
              this.getDefaultVietnameseMessage(status),
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
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ??
      String((request as Request & { id?: string | number }).id ?? '');
    if (requestId) {
      errorResponse.requestId = requestId;
      response.setHeader('x-request-id', requestId);
    }
    errorResponse.timestamp = new Date().toISOString();

    // Log error với context
    const statusCode = Number(status);
    if (statusCode >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${statusCode} - ${errorResponse.code}: ${errorResponse.message}`,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${statusCode} - ${errorResponse.code}: ${errorResponse.message}`,
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
      413: 'PAYLOAD_TOO_LARGE',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Provide a user-friendly Vietnamese message for common HTTP status codes
   * when no specific message is available from the exception.
   */
  private getDefaultVietnameseMessage(status: number): string {
    const messageMap: Record<number, string> = {
      400: 'Yêu cầu không hợp lệ',
      401: 'Chưa đăng nhập hoặc phiên đã hết hạn',
      403: 'Bạn không có quyền thực hiện thao tác này',
      404: 'Không tìm thấy tài nguyên yêu cầu',
      409: 'Dữ liệu bị trùng lặp',
      413: 'Dữ liệu gửi lên quá lớn',
      422: 'Dữ liệu không thể xử lý',
      429: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
      500: 'Đã xảy ra lỗi không mong muốn',
      502: 'Máy chủ tạm thời không phản hồi',
      503: 'Dịch vụ tạm thời không khả dụng',
    };
    return messageMap[status] || 'Đã xảy ra lỗi không mong muốn';
  }
}
