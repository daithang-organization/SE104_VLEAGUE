import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            // Tự động gán request id
            genReqId: (req: {
              headers: Record<string, string | string[] | undefined>;
            }) => {
              return (
                (req.headers['x-request-id'] as string) || crypto.randomUUID()
              );
            },

            // Custom log level dựa trên status code
            customLogLevel: (
              _req: unknown,
              res: { statusCode: number },
              err: Error | undefined,
            ) => {
              if (res.statusCode >= 500 || err) return 'error';
              if (res.statusCode >= 400) return 'warn';
              return 'info';
            },

            // Tắt auto logging từ pino-http (dùng interceptor thay thế)
            // Chỉ giữ lại log từ các service và interceptor
            autoLogging: false,

            // Chọn những props nào của request/response sẽ được log
            customProps: () => ({
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

            // Serializers để format request/response - ngắn gọn
            serializers: {
              req: (req: {
                id?: string | number;
                method?: string;
                url?: string;
              }) => ({
                id: req.id,
                method: req.method,
                url: req.url,
              }),
              res: (res: { statusCode: number }) => ({
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
                    messageFormat: '{if context}[{context}] {end}{msg}',
                    customColors: 'error:red,warn:yellow,info:cyan,debug:gray',
                  },
                },

            // Log level
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
