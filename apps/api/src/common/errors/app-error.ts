import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export interface ErrorDetails {
  [key: string]: string | string[];
}

export class AppError extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
    public readonly details?: ErrorDetails,
  ) {
    super(
      {
        code,
        message,
        details,
      },
      status,
    );
  }
}

export class ErrorResponseDto {
  @ApiProperty({ example: 'AUTH_INVALID_CREDENTIALS' })
  code!: string;

  @ApiProperty({ example: 'Invalid email or password' })
  message!: string;

  @ApiProperty({
    example: { email: 'Invalid email format' },
    required: false,
  })
  details?: ErrorDetails;
}

// Auth-specific errors
export class InvalidCredentialsError extends AppError {
  constructor() {
    super(
      'AUTH_INVALID_CREDENTIALS',
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InvalidRefreshTokenError extends AppError {
  constructor() {
    super(
      'AUTH_INVALID_REFRESH_TOKEN',
      'Invalid or expired refresh token',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super('AUTH_TOKEN_EXPIRED', 'Token has expired', HttpStatus.UNAUTHORIZED);
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super('AUTH_USER_NOT_FOUND', 'User not found', HttpStatus.NOT_FOUND);
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor() {
    super('AUTH_EMAIL_EXISTS', 'Email already registered', HttpStatus.CONFLICT);
  }
}
