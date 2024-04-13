import { ApiProperty } from '@nestjs/swagger';

export class UpdateScheduleLessonDto {
  @ApiProperty()
  auditoryId: number;

  @ApiProperty()
  isRemote?: boolean;

  @ApiProperty()
  auditoryName: string;

  @ApiProperty()
  seatsNumber: number;
}
