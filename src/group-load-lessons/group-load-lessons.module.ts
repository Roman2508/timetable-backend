import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupEntity } from 'src/groups/entities/group.entity';
import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { GroupLoadLessonsService } from './group-load-lessons.service';
import { GroupLoadLessonEntity } from './entities/group-load-lesson.entity';
import { GroupLoadLessonsController } from './group-load-lessons.controller';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';
import { TeacherCategoryEntity } from 'src/teacher-categories/entities/teacher-category.entity';

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
    ]),
  ],
  exports: [GroupLoadLessonsService],
})
export class GroupLoadLessonsModule {}
