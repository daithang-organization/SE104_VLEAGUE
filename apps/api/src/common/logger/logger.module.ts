import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            // Tự động gán request id
            genReqId: (req) => {
              return (
                (req.headers['x-request-id'] as string) ||
                crypto.randomUUID()
              );
            },

            // Custom log level dựa trên status code
            customLogLevel: (req, res, err) => {
              if (res.statusCode >= 500 || err) return 'error';
              if (res.statusCode >= 400) return 'warn';
              return 'info';
            },

            // Custom message cho mỗi request
            customSuccessMessage: (req, res) => {
              return `${req.method} ${req.url} completed`;
            },

            customErrorMessage: (req, res, err) => {
              return `${req.method} ${req.url} failed`;
            },

            // Chọn những props nào của request/response sẽ được log
            customProps: (req) => ({
              context: 'HTTP',
            }),

            // Redact sensitive data
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.confirmPassword',
              ],
              censor: '***REDACTED***',
            },

            // Serializers để format request/response
            serializers: {
              req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                // Chỉ log body trong dev
                ...(isProduction ? {} : { body: req.raw?.body }),
              }),
              res: (res) => ({
                statusCode: res.statusCode,
              }),
            },

            // Transport config
            transport: isProduction
              ? undefined // JSON logs cho production
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    levelFirst: true,
                    translateTime: 'SYS:HH:MM:ss.l',
                    ignore: 'pid,hostname',
                    messageFormat:
                      '{if context}[{context}] {end}{msg}',
                    customColors:
                      'error:red,warn:yellow,info:cyan,debug:gray',
                  },
                },

            // Log level
            level: isProduction ? 'info' : 'debug',

            // Quiet routes (không log health check, favicon...)
            autoLogging: {
              ignore: (req) => {
                const ignorePaths = ['/health', '/favicon.ico'];
                return ignorePaths.includes(req.url || '');
              },
            },
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
