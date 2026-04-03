import { ApiProperty } from '@nestjs/swagger';

export class AttachSpecializationDto {
  @ApiProperty()
  planSubjectId: number;

  @ApiProperty()
  groupId: number;

  @ApiProperty()
  name: string;
}
