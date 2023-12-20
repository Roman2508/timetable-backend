import { ApiProperty } from '@nestjs/swagger';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

export class CreateOneGroupLoadLessonDto {
  @ApiProperty()
  planSubject: PlanSubjectEntity;

  @ApiProperty()
  planId: number;
}
