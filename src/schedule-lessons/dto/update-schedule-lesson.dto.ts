import { ApiProperty } from '@nestjs/swagger';

export class UpdateScheduleLessonDto {
  @ApiProperty()
  auditory: number;
}
