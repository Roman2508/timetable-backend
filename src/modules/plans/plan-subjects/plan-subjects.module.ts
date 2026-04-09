import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PlanSubjectsService } from './plan-subjects.service'
import { PlanSubjectEntity } from './entities/plan-subject.entity'
import { PlanSubjectsController } from './plan-subjects.controller'
import { GroupLoadLessonsModule } from 'src/modules/schedule/group-load-lessons/group-load-lessons.module'
import { TeacherCategoriesModule } from 'src/modules/core/teacher-categories/teacher-categories.module'
import { TeacherCategoryEntity } from 'src/modules/core/teacher-categories/entities/teacher-category.entity'
import { PlanSubjectAttachmentEntity } from './entities/plan-subject-attachment.entity'
import { GoogleDriveModule } from 'src/integrations/google-drive/google-drive.module'

@Module({
  controllers: [PlanSubjectsController],
  providers: [PlanSubjectsService],
  imports: [
    TypeOrmModule.forFeature([PlanSubjectEntity, PlanSubjectAttachmentEntity, TeacherCategoryEntity]),
    GroupLoadLessonsModule,
    TeacherCategoriesModule,
    GoogleDriveModule,
  ],
  exports: [PlanSubjectsService],
})
export class PlanSubjectsModule {}
