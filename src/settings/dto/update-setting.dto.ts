import { ApiProperty } from '@nestjs/swagger';

export class LessonCall {
  @ApiProperty({ default: '08:30' })
  start: string;

  @ApiProperty({ default: '09:50' })
  end: string;
}

export class Lesson {
  @ApiProperty()
  ['1']: LessonCall;

  @ApiProperty()
  ['2']: LessonCall;

  @ApiProperty()
  ['3']: LessonCall;

  @ApiProperty()
  ['4']: LessonCall;

  @ApiProperty()
  ['5']: LessonCall;

  @ApiProperty()
  ['6']: LessonCall;

  @ApiProperty()
  ['7']: LessonCall;
}

export class UpdateSettingDto {
  @ApiProperty()
  firstSemesterStart: string;

  @ApiProperty()
  firstSemesterEnd: string;

  @ApiProperty()
  secondSemesterStart: string;

  @ApiProperty()
  secondSemesterEnd: string;

  @ApiProperty()
  callSchedule: Lesson;
}
