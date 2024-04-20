import { ApiProperty } from '@nestjs/swagger';

export class UpdateGoogleCalendarEventDto {
  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  location: string;
}
