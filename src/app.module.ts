import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { UserEntity } from './users/entities/user.entity';
import { PlanEntity } from './plans/entities/plan.entity';
import { TeachersModule } from './teachers/teachers.module';
import { AuditoriesModule } from './auditories/auditories.module';
import { TeacherEntity } from './teachers/entities/teacher.entity';
import { AuditoryEntity } from './auditories/entities/auditory.entity';
import { PlanSubjectsModule } from './plan-subjects/plan-subjects.module';
import { PlanCategoriesModule } from './plan-categories/plan-categories.module';
import { PlanSubjectEntity } from './plan-subjects/entities/plan-subject.entity';
import { PlanCategoryEntity } from './plan-categories/entities/plan-category.entity';
import { TeacherCategoriesModule } from './teacher-categories/teacher-categories.module';
import { AuditoryCategoriesModule } from './auditory-categories/auditory-categories.module';
import { TeacherCategoryEntity } from './teacher-categories/entities/teacher-category.entity';
import { AuditoryCategoryEntity } from './auditory-categories/entities/auditory-category.entity';
import { GroupCategoriesModule } from './group-categories/group-categories.module';
import { GroupsModule } from './groups/groups.module';
import { GroupCategoryEntity } from './group-categories/entities/group-category.entity';
import { GroupEntity } from './groups/entities/group.entity';
import { GroupLoadLessonsModule } from './group-load-lessons/group-load-lessons.module';
import { GroupLoadLessonEntity } from './group-load-lessons/entities/group-load-lesson.entity';
import { StreamsModule } from './streams/streams.module';
import { StreamEntity } from './streams/entities/stream.entity';
import { ScheduleLessonsModule } from './schedule-lessons/schedule-lessons.module';
import { ScheduleLessonsEntity } from './schedule-lessons/entities/schedule-lesson.entity';

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
        AuditoryCategoryEntity,
        AuditoryEntity,
        GroupCategoryEntity,
        GroupEntity,
        GroupLoadLessonEntity,
        StreamEntity,
        ScheduleLessonsEntity,
      ],
      extra: {
        max: 1, // set pool max size
      },
      synchronize: true,
    }),
    PlanCategoriesModule,
    PlansModule,
    PlanSubjectsModule,
    UsersModule,
    AuthModule,
    TeacherCategoriesModule,
    TeachersModule,
    AuditoryCategoriesModule,
    AuditoriesModule,
    GroupCategoriesModule,
    GroupsModule,
    GroupLoadLessonsModule,
    StreamsModule,
    ScheduleLessonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
