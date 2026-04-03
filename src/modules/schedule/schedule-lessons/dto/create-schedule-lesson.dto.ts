import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleLessonDto {
  @ApiProperty()
  id: number;

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

  // Всього годин з дисципліни
  @ApiProperty()
  hours: number;

  // К-ть год поточного уроку (1 або 2)
  @ApiProperty()
  currentLessonHours: number;

  @ApiProperty()
  isRemote?: boolean;

  @ApiProperty()
  group: number;

  @ApiProperty()
  teacher: number;

  @ApiProperty()
  auditory?: number;

  @ApiProperty()
  stream: number;
}
