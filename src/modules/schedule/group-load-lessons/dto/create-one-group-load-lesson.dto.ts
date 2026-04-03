import { ApiProperty } from '@nestjs/swagger'
import { PlanSubjectEntity } from 'src/modules/plans/plan-subjects/entities/plan-subject.entity'

export class CreateOneGroupLoadLessonDto {
  @ApiProperty()
  planSubject: PlanSubjectEntity

  @ApiProperty()
  planId: number
}
