import { ApiProperty } from '@nestjs/swagger';
import { LessonCall } from '../entities/setting.entity';

export class UpdateCallScheduleDto {
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
