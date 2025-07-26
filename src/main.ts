import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN.split(','),
    credentials: true,
  });

  const config = new DocumentBuilder().setTitle('Timetable').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  try {
    await app.listen(process.env.APP_PORT);
    console.log(`🚀 Server is running at port: ${process.env.APP_PORT}`);
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`, error);
    process.exit(1);
  }
}

bootstrap();
