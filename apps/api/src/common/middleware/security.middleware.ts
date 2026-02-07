import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

/**
 * Security middleware that applies Helmet protections
 * - XSS Protection
 * - Content Security Policy
 * - HSTS (HTTP Strict Transport Security)
 * - Prevent clickjacking (X-Frame-Options)
 * - Hide X-Powered-By header
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly helmetMiddleware: ReturnType<typeof helmet>;

  constructor() {
    this.helmetMiddleware = helmet({
      // Content Security Policy - adjust for your needs
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      // HSTS - force HTTPS (only in production)
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      // Prevent clickjacking
      frameguard: {
        action: 'deny',
      },
      // Hide X-Powered-By header
      hidePoweredBy: true,
      // Prevent MIME type sniffing
      noSniff: true,
      // XSS filter (legacy browsers)
      xssFilter: true,
      // Referrer Policy
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.helmetMiddleware(req, res, next);
  }
}
