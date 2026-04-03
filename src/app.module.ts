import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { AppController } from './app.controller'
import { UsersModule } from './users/users.module'
import { PlansModule } from './modules/plans/plans/plans.module'
import { RolesModule } from './roles/roles.module'
import { GroupsModule } from './modules/core/groups/groups.module'
import { GradesModule } from './modules/grade-book/grades/grades.module'
import { StreamsModule } from './modules/core/streams/streams.module'
import { UserEntity } from './users/entities/user.entity'
import { RoleEntity } from './roles/entities/role.entity'
import { PlanEntity } from './modules/plans/plans/entities/plan.entity'
import { LocalAuthGuard } from './auth/guards/auth.guard'
import { TeachersModule } from './modules/core/teachers/teachers.module'
import { SettingsModule } from './modules/settings/settings.module'
import { StudentsModule } from './modules/core/students/students.module'
import { GroupEntity } from './modules/core/groups/entities/group.entity'
import { GradesEntity } from './modules/grade-book/grades/entities/grade.entity'
import { StreamEntity } from './modules/core/streams/entities/stream.entity'
import { GradeBookModule } from './modules/grade-book/grade-book/grade-book.module'
import { AuditoriesModule } from './modules/core/auditories/auditories.module'
import { TeacherEntity } from './modules/core/teachers/entities/teacher.entity'
import { StudentEntity } from './modules/core/students/entities/student.entity'
import { SettingsEntity } from './modules/settings/entities/setting.entity'
import { PermissionEntity } from './roles/entities/permission.entity'
import { AuditoryEntity } from './modules/core/auditories/entities/auditory.entity'
import { GoogleDriveModule } from './integrations/google-drive/google-drive.module'
import { GoogleAdminModule } from './integrations/google-admin/google-admin.module'
import { GradeBookEntity } from './modules/grade-book/grade-book/entities/grade-book.entity'
import { PlanSubjectsModule } from './modules/plans/plan-subjects/plan-subjects.module'
import { TeacherReportModule } from './modules/reports/teacher-report/teacher-report.module'
import { GoogleCalendarModule } from './integrations/google-calendar/google-calendar.module'
import { PlanSubjectEntity } from './modules/plans/plan-subjects/entities/plan-subject.entity'
import { GroupCategoriesModule } from './modules/core/group-categories/group-categories.module'
import { ScheduleLessonsModule } from './modules/schedule/schedule-lessons/schedule-lessons.module'
import { TeacherReportEntity } from './modules/reports/teacher-report/entities/teacher-report.entity'
import { GroupCategoryEntity } from './modules/core/group-categories/entities/group-category.entity'
import { GroupLoadLessonsModule } from './modules/schedule/group-load-lessons/group-load-lessons.module'
import { TeacherCategoriesModule } from './modules/core/teacher-categories/teacher-categories.module'
import { ScheduleLessonsEntity } from './modules/schedule/schedule-lessons/entities/schedule-lesson.entity'
import { AuditoryCategoriesModule } from './modules/core/auditory-categories/auditory-categories.module'
import { TeacherCategoryEntity } from './modules/core/teacher-categories/entities/teacher-category.entity'
import { GroupLoadLessonEntity } from './modules/schedule/group-load-lessons/entities/group-load-lesson.entity'
import { AuditoryCategoryEntity } from './modules/core/auditory-categories/entities/auditory-category.entity'
import { IndividualTeacherWorkModule } from './modules/reports/individual-teacher-work/individual-teacher-work.module'
import { InstructionalMaterialsModule } from './modules/reports/instructional-materials/instructional-materials.module'
import { InstructionalMaterialEnity } from './modules/reports/instructional-materials/entities/instructional-material.entity'
import { IndividualTeacherWorkEntity } from './modules/reports/individual-teacher-work/entities/individual-teacher-work.entity'
import { PlanCategoryEntity } from './modules/plans/plan-categories/entities/plan-category.entity'
import { PlanCategoriesModule } from './modules/plans/plan-categories/plan-categories.module'
import { migrations } from './migrations'

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
        RoleEntity,
        GroupEntity,
        GradesEntity,
        StreamEntity,
        StudentEntity,
        TeacherEntity,
        SettingsEntity,
        AuditoryEntity,
        GradeBookEntity,
        PermissionEntity,
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
      synchronize: false,
      migrationsRun: true,
      migrations: migrations,
      extra: { max: 20, min: 2 },
      maxQueryExecutionTime: 1000,
      logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    }),
    AuthModule,
    PlansModule,
    UsersModule,
    RolesModule,
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: LocalAuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
