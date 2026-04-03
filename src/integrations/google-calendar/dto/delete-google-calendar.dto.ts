import { ApiProperty } from '@nestjs/swagger';

export class DeleteGoogleCalendarDto {
  @ApiProperty()
  calendarId: string;
}
