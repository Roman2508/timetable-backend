import { ApiProperty } from '@nestjs/swagger';

export class CreateGoogleCalendarEventDto {
  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;
}
