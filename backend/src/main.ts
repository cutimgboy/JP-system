import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter';
import { TransformInterceptor } from './core/interceptor/transform/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, LogLevel, ValidationPipe } from '@nestjs/common';
import { getAllowedOrigins, isProduction } from './config/security';

function resolveLoggerLevels(prod: boolean): LogLevel[] {
  const configuredLevels = process.env.LOG_LEVELS;

  if (configuredLevels) {
    return configuredLevels
      .split(',')
      .map((level) => level.trim())
      .filter((level): level is LogLevel =>
        ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'].includes(level),
      );
  }

  return prod
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug', 'verbose'];
}

async function bootstrap() {
  const prod = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: resolveLoggerLevels(prod),
  });
  const configService = app.get(ConfigService);
  const allowedOrigins = getAllowedOrigins(configService);
  const configProd = isProduction(configService);

  // 启用 CORS（支持 SSE）
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new ForbiddenException('CORS origin not allowed'), false);
    },
    credentials: true,
  });

  app.use((_, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );
    next();
  });

  // 注册全局错误的过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  // 全局注册拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  // 注册全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const enableSwagger =
    !configProd || configService.get('ENABLE_SWAGGER', 'false') === 'true';
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('接口文档')
      .setDescription('接口文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
