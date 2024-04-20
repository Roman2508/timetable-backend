import { ApiProperty } from '@nestjs/swagger';

export class UpdateGoogleCalendarDto {
  @ApiProperty()
  calendarId: string;

  // Шифр групи або ПІБ викладача
  @ApiProperty()
  owner: string;
}
