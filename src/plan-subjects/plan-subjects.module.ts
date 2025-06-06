import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanSubjectsService } from './plan-subjects.service';
import { PlanSubjectEntity } from './entities/plan-subject.entity';
import { PlanSubjectsController } from './plan-subjects.controller';
import { GroupLoadLessonsModule } from 'src/group-load-lessons/group-load-lessons.module';
import { TeacherCategoryEntity } from 'src/teacher-categories/entities/teacher-category.entity';

@Module({
  controllers: [PlanSubjectsController],
  providers: [PlanSubjectsService],
  imports: [TypeOrmModule.forFeature([PlanSubjectEntity, TeacherCategoryEntity]), GroupLoadLessonsModule],
  exports: [PlanSubjectsService],
})
export class PlanSubjectsModule {}
