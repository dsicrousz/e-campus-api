import "./instrument";

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exection-filter';

declare const __dirname: string;

const logger = new Logger('Main');


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  
  // CORS origins from environment variable, fallback to localhost
  const corsOrigins = config.get('CORS_ORIGINS')?.split(',') || ['http://localhost:3000', 'http://localhost:55864'];
  logger.log(`CORS origins configured: ${JSON.stringify(corsOrigins)}`);
  
  // CORS must be enabled before other middleware
  app.enableCors({
    origin: corsOrigins,
    allowedHeaders: ['authorization', 'content-type', 'cookie', 'x-session-token'],
    exposedHeaders: ['set-cookie'],
    methods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(json({limit:'10mb'}));
  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    setHeaders: (res,path,stat) => {
      res.set('Access-Control-Allow-Origin', corsOrigins[0]);
    },
    prefix: '/uploads/',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV == 'production',
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  const port = config.get('NEST_PORT');
  await app.listen(port, () => logger.log(`App started at port: ${port}`));
}
bootstrap();
