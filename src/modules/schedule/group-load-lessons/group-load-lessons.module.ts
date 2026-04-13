import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { GradesModule } from 'src/modules/grade-book/grades/grades.module'
import { GroupEntity } from 'src/modules/core/groups/entities/group.entity'
import { TeacherEntity } from 'src/modules/core/teachers/entities/teacher.entity'
import { GroupLoadLessonsService } from './group-load-lessons.service'
import { GroupLoadLessonEntity } from './entities/group-load-lesson.entity'
import { GroupLoadLessonsController } from './group-load-lessons.controller'
import { PlanSubjectEntity } from 'src/modules/plans/plan-subjects/entities/plan-subject.entity'
import { TeacherCategoryEntity } from 'src/modules/core/teacher-categories/entities/teacher-category.entity'
import { InstructionalMaterialEnity } from 'src/modules/reports/instructional-materials/entities/instructional-material.entity'

@Module({
  controllers: [GroupLoadLessonsController],
  providers: [GroupLoadLessonsService],
  imports: [
    TypeOrmModule.forFeature([
      GroupLoadLessonEntity,
      TeacherCategoryEntity,
      PlanSubjectEntity,
      TeacherEntity,
      GroupEntity,
      InstructionalMaterialEnity,
    ]),
    GradesModule,
  ],
  exports: [GroupLoadLessonsService],
})
export class GroupLoadLessonsModule {}
