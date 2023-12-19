import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupLoadLessonDto {
  @ApiProperty()
  groupId: number;

  @ApiProperty()
  educationPlanId: number;

  @ApiProperty()
  students: number;
}
