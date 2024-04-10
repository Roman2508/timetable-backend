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
  typeRu: 'ЛК' | 'ПЗ' | 'ЛАБ' | 'СЕМ' | 'ЕКЗ';

  @ApiProperty()
  subgroupNumber: number | null;

  @ApiProperty()
  specialization: string | null;

  @ApiProperty()
  students: number;

  @ApiProperty()
  hours: number;

  @ApiProperty()
  group: number;

  @ApiProperty()
  teacher: number;

  @ApiProperty()
  auditory: number;

  @ApiProperty()
  stream: number;
}
