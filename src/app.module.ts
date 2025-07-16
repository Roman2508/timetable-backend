import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { GroupsModule } from './groups/groups.module';
import { GradesModule } from './grades/grades.module';
import { StreamsModule } from './streams/streams.module';
import { UserEntity } from './users/entities/user.entity';
import { PlanEntity } from './plans/entities/plan.entity';
import { TeachersModule } from './teachers/teachers.module';
import { SettingsModule } from './settings/settings.module';
import { StudentsModule } from './students/students.module';
import { GroupEntity } from './groups/entities/group.entity';
import { GradesEntity } from './grades/entities/grade.entity';
import { StreamEntity } from './streams/entities/stream.entity';
import { GradeBookModule } from './grade-book/grade-book.module';
import { AuditoriesModule } from './auditories/auditories.module';
import { TeacherEntity } from './teachers/entities/teacher.entity';
import { StudentEntity } from './students/entities/student.entity';
import { SettingsEntity } from './settings/entities/setting.entity';
import { AuditoryEntity } from './auditories/entities/auditory.entity';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { GoogleAdminModule } from './google-admin/google-admin.module';
import { GradeBookEntity } from './grade-book/entities/grade-book.entity';
import { PlanSubjectsModule } from './plan-subjects/plan-subjects.module';
import { TeacherReportModule } from './teacher-report/teacher-report.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { PlanCategoriesModule } from './plan-categories/plan-categories.module';
import { PlanSubjectEntity } from './plan-subjects/entities/plan-subject.entity';
import { GroupCategoriesModule } from './group-categories/group-categories.module';
import { ScheduleLessonsModule } from './schedule-lessons/schedule-lessons.module';
import { PlanCategoryEntity } from './plan-categories/entities/plan-category.entity';
import { TeacherReportEntity } from './teacher-report/entities/teacher-report.entity';
import { GroupCategoryEntity } from './group-categories/entities/group-category.entity';
import { GroupLoadLessonsModule } from './group-load-lessons/group-load-lessons.module';
import { TeacherCategoriesModule } from './teacher-categories/teacher-categories.module';
import { ScheduleLessonsEntity } from './schedule-lessons/entities/schedule-lesson.entity';
import { AuditoryCategoriesModule } from './auditory-categories/auditory-categories.module';
import { TeacherCategoryEntity } from './teacher-categories/entities/teacher-category.entity';
import { GroupLoadLessonEntity } from './group-load-lessons/entities/group-load-lesson.entity';
import { AuditoryCategoryEntity } from './auditory-categories/entities/auditory-category.entity';
import { IndividualTeacherWorkModule } from './individual-teacher-work/individual-teacher-work.module';
import { InstructionalMaterialsModule } from './instructional-materials/instructional-materials.module';
import { InstructionalMaterialEnity } from './instructional-materials/entities/instructional-material.entity';
import { IndividualTeacherWorkEntity } from './individual-teacher-work/entities/individual-teacher-work.entity';

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
      ssl: { rejectUnauthorized: false },
      entities: [
        PlanEntity,
        UserEntity,
        GroupEntity,
        GradesEntity,
        StreamEntity,
        StudentEntity,
        TeacherEntity,
        SettingsEntity,
        AuditoryEntity,
        GradeBookEntity,
        PlanSubjectEntity,
        PlanCategoryEntity,
        GroupCategoryEntity,
        TeacherReportEntity,
        TeacherCategoryEntity,
        ScheduleLessonsEntity,
        GroupLoadLessonEntity,
        AuditoryCategoryEntity,
        InstructionalMaterialEnity,
        IndividualTeacherWorkEntity,
      ],
      extra: {
        max: 1, // set pool max size
      },
      synchronize: true,
    }),
    AuthModule,
    PlansModule,
    UsersModule,
    GroupsModule,
    GradesModule,
    StreamsModule,
    SettingsModule,
    StudentsModule,
    TeachersModule,
    GradeBookModule,
    AuditoriesModule,
    GoogleDriveModule,
    GoogleAdminModule,
    PlanSubjectsModule,
    TeacherReportModule,
    PlanCategoriesModule,
    GoogleCalendarModule,
    ScheduleLessonsModule,
    GroupCategoriesModule,
    GroupLoadLessonsModule,
    TeacherCategoriesModule,
    AuditoryCategoriesModule,
    IndividualTeacherWorkModule,
    InstructionalMaterialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
