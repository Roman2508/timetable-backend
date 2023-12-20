import { ApiProperty } from '@nestjs/swagger';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

export class UpdateGroupLoadLessonHoursDto {
  @ApiProperty()
  planSubject: PlanSubjectEntity;

  @ApiProperty()
  planId: number;

  // @ApiProperty()
  // groupId: number;

  //   @ApiProperty()
  //   students: number;
}
