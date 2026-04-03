import { ApiProperty } from '@nestjs/swagger';

export class CopyDayOfScheduleDto {
  @ApiProperty()
  groupId: number;

  @ApiProperty()
  copyFromDay: string;

  @ApiProperty()
  copyToDay: string;
}
