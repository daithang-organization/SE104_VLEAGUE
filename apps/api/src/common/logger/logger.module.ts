import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const logLevel =
          configService.get<string>('LOG_LEVEL') ??
          (isProduction ? 'info' : 'debug');

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

            // Transport config - Enhanced for better visual experience
            transport: isProduction
              ? undefined // JSON logs cho production
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    levelFirst: false,
                    translateTime: 'SYS:HH:mm:ss',
                    ignore: 'pid,hostname',
                    singleLine: false,
                    messageFormat: '{if context}[{context}]{end} {msg}',
                    // Đẹp mắt với màu sắc phân biệt
                    customColors:
                      'error:red,warn:yellow,info:green,debug:blue,trace:gray',
                    minimumLevel: logLevel,
                  },
                },

            // Log level
            level: logLevel,
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
