import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

type RequestWithId = Request & { id?: string };

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction) {
    const incomingRequestId = req.headers['x-request-id'];
    const requestId =
      (Array.isArray(incomingRequestId)
        ? incomingRequestId[0]
        : incomingRequestId) || randomUUID();

    req.id = requestId;
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    next();
  }
}
