import { ApiProperty } from '@nestjs/swagger';

export class UpdateScheduleLessonDto {
  @ApiProperty()
  currentLessonHours: number;

  @ApiProperty()
  auditoryName: string;

  @ApiProperty()
  seatsNumber: number;

  @ApiProperty()
  auditoryId: number;

  @ApiProperty()
  isRemote?: boolean;
}
