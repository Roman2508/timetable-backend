import { ApiProperty } from '@nestjs/swagger';

export class UpdateScheduleLessonDto {
  @ApiProperty()
  auditoryId: number;

  @ApiProperty()
  auditoryName: string;

  @ApiProperty()
  seatsNumber: number;
}
