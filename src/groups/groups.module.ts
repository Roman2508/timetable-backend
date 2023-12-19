import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';
import { GroupLoadLessonsModule } from 'src/group-load-lessons/group-load-lessons.module';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService],
  imports: [
    TypeOrmModule.forFeature([GroupEntity, PlanSubjectEntity]),
    GroupLoadLessonsModule,
  ],
})
export class GroupsModule {}
