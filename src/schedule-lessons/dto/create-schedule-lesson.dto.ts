import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleLessonDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  lessonNumber: number;

  @ApiProperty()
  semester: number;

  @ApiProperty()
  students: number;

  @ApiProperty()
  group: number;

  @ApiProperty()
  teacher: number;

  @ApiProperty()
  auditory: number;

  @ApiProperty()
  stream: number;
}
