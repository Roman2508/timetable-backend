import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ms, StringValue } from './utils/ms.util';
import { RedisService } from './redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const redis = app.get(RedisService);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  app.enableCors({
    origin: config
      .get('ALLOWED_ORIGIN')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  app.use(
    session({
      secret: config.get('SESSION_SECRET'),
      name: config.get('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: ms(config.get<StringValue>('SESSION_MAX_AGE')),
        secure: config.get('SESSION_SECURE'),
        sameSite: config.get('SESSION_SAME_SITE'),
        httpOnly: config.get('SESSION_HTTP_ONLY'),
      },
      store: new RedisStore({
        client: redis,
        prefix: config.get('SESSION_FOLDER'),
      }),
    }),
  );

  const swaggerConfig = new DocumentBuilder().setTitle('LMS').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(config.get('APP_PORT'));
}

bootstrap();
