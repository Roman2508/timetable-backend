import { Module } from '@nestjs/common';
import { PlanSubjectsService } from './plan-subjects.service';
import { PlanSubjectsController } from './plan-subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanSubjectEntity } from './entities/plan-subject.entity';

@Module({
  controllers: [PlanSubjectsController],
  providers: [PlanSubjectsService],
  imports: [TypeOrmModule.forFeature([PlanSubjectEntity])],
})
export class PlanSubjectsModule {}
