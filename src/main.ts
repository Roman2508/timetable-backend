import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  app.enableCors({ credentials: false, origin: true });

  const config = new DocumentBuilder()
    .setTitle('Timetable')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(7777);
}

bootstrap();

/* plans */
/* auditories */
/* teachers */

/* groups ??? */
/* streams ??? */
/* load ??? */
/* schedule ??? */

// examsConsultation, metodologicalGuidance - створювати для цих видів зянять group-load-lessons !!!
// add GoogleCalendarId to groups and teachers
// totalHours в plan-subjects повинна вказуватись вручну

// frontend: notifications react-toastify

// на frontend в таблиці дисциплін потоку потрібно відображати тільки ті дисципліни, які можна об'єднати
// тобто ті в яких однакові такі поля: name, semesterNumber, typeEn, hours, subgroupNumber
