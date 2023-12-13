import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PlansModule } from './plans/plans.module';
import { PlanCategoriesModule } from './plan-categories/plan-categories.module';
import { PlanSubjectsModule } from './plan-subjects/plan-subjects.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanCategoryEntity } from './plan-categories/entities/plan-category.entity';
import { PlanEntity } from './plans/entities/plan.entity';
import { PlanSubjectEntity } from './plan-subjects/entities/plan-subject.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './users/entities/user.entity';
import { TeacherCategoriesModule } from './teacher-categories/teacher-categories.module';
import { TeachersModule } from './teachers/teachers.module';
import { TeacherCategoryEntity } from './teacher-categories/entities/teacher-category.entity';
import { TeacherEntity } from './teachers/entities/teacher.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        PlanCategoryEntity,
        PlanEntity,
        PlanSubjectEntity,

        UserEntity,

        TeacherCategoryEntity,
        TeacherEntity,
      ],
      synchronize: true,
    }),
    PlanCategoriesModule,
    PlansModule,
    PlanSubjectsModule,

    UsersModule,
    AuthModule,

    TeacherCategoriesModule,
    TeachersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
