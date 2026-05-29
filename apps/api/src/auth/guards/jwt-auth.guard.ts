import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AppError } from '../../common/errors';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface JwtInfo {
  name?: string;
  message?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
    info: JwtInfo | undefined,
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
