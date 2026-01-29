import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AppError } from '../../common/errors';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
  ): TUser {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new AppError(
          'AUTH_TOKEN_EXPIRED',
          'Access token has expired',
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new AppError(
          'AUTH_INVALID_TOKEN',
          'Invalid access token',
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new AppError(
        'AUTH_UNAUTHORIZED',
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
