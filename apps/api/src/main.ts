import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { existsSync, mkdirSync } from 'fs';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Serve uploaded files statically
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });

  // Sử dụng Pino Logger cho toàn bộ app
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Security headers with Helmet (only in production to avoid CSP issues in dev)
  if (process.env.NODE_ENV === 'production') {
    const helmet = await import('helmet');
    app.use(
      helmet.default({
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
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      }),
    );
    logger.log('🛡️  Helmet security headers enabled', 'Bootstrap');
  }

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Global exception filter for unified error shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor - đo performance và log request/response
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('VLeague API')
    .setDescription('V-League Football Management System API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Health', 'Application health check')
    .addTag('Teams', 'Team management endpoints')
    .addTag('Players', 'Player management endpoints')
    .addTag('Matches', 'Match scheduling and management')
    .addTag('Scheduling', 'Schedule generation and publishing')
    .addTag('Standings', 'League standings and statistics')
    .addTag('Seasons', 'Season management')
    .addTag('Stadiums', 'Stadium management')
    .addTag('Roster', 'Team roster management')
    .addTag('Regulations', 'Season regulation rules')
    .addTag('Users', 'User management (ADMIN)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // Startup logs chuyên nghiệp
  logger.log(`🚀 Application started successfully`, 'Bootstrap');
  logger.log(`📍 Server running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
  logger.log(
    `🔧 Environment: ${process.env.NODE_ENV || 'development'}`,
    'Bootstrap',
  );
}
void bootstrap();
