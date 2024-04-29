import { ApiProperty } from '@nestjs/swagger';

export class CopyWeekOfScheduleDto {
  @ApiProperty()
  groupId: number;

  @ApiProperty()
  copyFromStartDay: string;

  @ApiProperty()
  copyToStartDay: string;
}
