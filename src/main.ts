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
  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    setHeaders: (res,path,stat) => {
      res.set('Access-Control-Allow-Origin', corsOrigins);
    },
    prefix: '/uploads/',
  });
  app.use(helmet());
  app.use(json({limit:'10mb'}));
  app.enableCors({
    origin: corsOrigins,
    allowedHeaders:"authorization,credentials,content-type",
    methods: 'GET,PUT,POST,DELETE,PATCH,UPDATE,OPTIONS',
    credentials:true,
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
