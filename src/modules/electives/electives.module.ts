import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ElectivesService } from './electives.service'
import { ElectivesController } from './electives.controller'
import { StudentEntity } from '../core/students/entities/student.entity'
import { ElectiveSessionEntity } from './entities/elective-session.entity'
import { ElectiveStudentChoiceEntity } from './entities/elective-student-choice.entity'
import { GroupEntity } from '../core/groups/entities/group.entity'
import { StreamEntity } from '../core/streams/entities/stream.entity'
import { PlanSubjectEntity } from '../plans/plan-subjects/entities/plan-subject.entity'
import { GroupLoadLessonEntity } from '../schedule/group-load-lessons/entities/group-load-lesson.entity'
import { GroupLoadLessonsModule } from '../schedule/group-load-lessons/group-load-lessons.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ElectiveSessionEntity,
      ElectiveStudentChoiceEntity,
      StudentEntity,
      GroupEntity,
      StreamEntity,
      PlanSubjectEntity,
      GroupLoadLessonEntity,
    ]),
    GroupLoadLessonsModule,
  ],
  controllers: [ElectivesController],
  providers: [ElectivesService],
  exports: [ElectivesService],
})
export class ElectivesModule {}

