import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupLoadLessonsService } from './group-load-lessons.service';
import { GroupLoadLessonEntity } from './entities/group-load-lesson.entity';
import { GroupLoadLessonsController } from './group-load-lessons.controller';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

@Module({
  controllers: [GroupLoadLessonsController],
  providers: [GroupLoadLessonsService],
  imports: [
    TypeOrmModule.forFeature([GroupLoadLessonEntity, PlanSubjectEntity]),
  ],
  exports: [GroupLoadLessonsService],
})
export class GroupLoadLessonsModule {}
