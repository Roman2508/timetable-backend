import { ApiProperty } from '@nestjs/swagger';

export class FindCalendarEventDto {
  @ApiProperty()
  lessonName: string;

  @ApiProperty()
  lessonNumber: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  groupName: string;

  @ApiProperty()
  subgroupNumber: number | null;

  @ApiProperty()
  auditoryName: string;

  @ApiProperty()
  itemId: number;

  @ApiProperty()
  type: 'teacher' | 'group';
}
