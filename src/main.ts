import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule, { cors: false });
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // app.enableCors({ credentials: false, origin: true });
  app.enableCors({
    origin: 'http://localhost:5173', // 👈 дозволити фронтенд
    credentials: true, // 👈 дозволити куки
  });

  const config = new DocumentBuilder().setTitle('Timetable').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(7777);
}

bootstrap();
