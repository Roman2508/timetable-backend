import { Module } from '@nestjs/common';
import { PlanSubjectsService } from './plan-subjects.service';
import { PlanSubjectsController } from './plan-subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanSubjectEntity } from './entities/plan-subject.entity';
import { GroupLoadLessonsModule } from 'src/group-load-lessons/group-load-lessons.module';
import { TeacherCategoryEntity } from 'src/teacher-categories/entities/teacher-category.entity';

@Module({
  controllers: [PlanSubjectsController],
  providers: [PlanSubjectsService],
  imports: [
    TypeOrmModule.forFeature([PlanSubjectEntity, TeacherCategoryEntity]),
    GroupLoadLessonsModule,
  ],
})
export class PlanSubjectsModule {}
