import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs cho đến khi Logger được khởi tạo
  });

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
    .addTag('Season', 'Season management')
    .addTag('Stadium', 'Stadium management')
    .addTag('Roster', 'Team roster management')
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
