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
    .setDescription(
      'V-League Football Management System API - SE104 Project\n\n' +
        '## Overview\n' +
        'Hệ thống quản lý giải bóng đá VLeague, hỗ trợ:\n' +
        '- 🔐 Xác thực & phân quyền người dùng\n' +
        '- 👥 Quản lý đội bóng & cầu thủ\n' +
        '- 📅 Lập lịch thi đấu tự động\n' +
        '- ⚽ Ghi nhận kết quả trận đấu\n\n' +
        '## Demo Accounts\n' +
        'Password: `Demo@12345`\n' +
        '- Admin: `admin@demo.local`\n' +
        '- Team Manager: `teammanager@demo.local`',
    )
    .setVersion('1.0.0')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setExternalDoc(
      'GitHub Repository',
      'https://github.com/daithang-organization/SE104_VLEAGUE',
    )
    .setContact(
      'SE104 Team',
      'https://github.com/daithang-organization/SE104_VLEAGUE',
      'admin@vleague.local',
    )
    .addServer('http://localhost:8080', 'Local Development')
    .addServer('https://api.vleague.example.com', 'Production (placeholder)')
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
    .addTag('Teams', 'Team management endpoints')
    .addTag('Players', 'Player management endpoints')
    .addTag('Matches', 'Match scheduling and management')
    .addTag('Scheduling', 'Schedule generation and publishing')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // ═══════════════════════════════════════════════════════════════════════════
  // STARTUP BANNER - Beautiful console output
  // ═══════════════════════════════════════════════════════════════════════════
  const divider = '═'.repeat(60);
  const env = process.env.NODE_ENV || 'development';

  console.log('\n');
  console.log('\x1b[36m' + divider + '\x1b[0m');
  console.log(
    '\x1b[36m' +
      '   __     ___                                  _    ____ ___ ' +
      '\x1b[0m',
  );
  console.log(
    '\x1b[36m' +
      '   \\ \\   / / |    ___  __ _  __ _ _   _  ___  / \\  |  _ \\_ _|' +
      '\x1b[0m',
  );
  console.log(
    '\x1b[36m' +
      '    \\ \\ / /| |   / _ \\/ _` |/ _` | | | |/ _ \\/  _\\ | |_) | | ' +
      '\x1b[0m',
  );
  console.log(
    '\x1b[36m' +
      '     \\ V / | |__|  __/ (_| | (_| | |_| |  __/ ___ \\|  __/| | ' +
      '\x1b[0m',
  );
  console.log(
    '\x1b[36m' +
      '      \\_/  |_____\\___|\\__,_|\\__, |\\__,_|\\___/_/   \\_\\_|  |___|' +
      '\x1b[0m',
  );
  console.log(
    '\x1b[36m' +
      '                            |___/                            ' +
      '\x1b[0m',
  );
  console.log('\x1b[36m' + divider + '\x1b[0m');
  console.log('');
  console.log(
    '  \x1b[32m✓\x1b[0m \x1b[1mStatus:\x1b[0m       \x1b[32mRunning\x1b[0m',
  );
  console.log(
    `  \x1b[32m✓\x1b[0m \x1b[1mURL:\x1b[0m          \x1b[36mhttp://localhost:${port}\x1b[0m`,
  );
  console.log(
    `  \x1b[32m✓\x1b[0m \x1b[1mSwagger:\x1b[0m      \x1b[36mhttp://localhost:${port}/docs\x1b[0m`,
  );
  console.log(
    `  \x1b[32m✓\x1b[0m \x1b[1mEnvironment:\x1b[0m  \x1b[33m${env}\x1b[0m`,
  );
  console.log('');
  console.log('\x1b[36m' + divider + '\x1b[0m');
  console.log('\n');

  // Keep pino logs for runtime
  logger.log(`Application is listening on port ${port}`, 'Bootstrap');
}
void bootstrap();
