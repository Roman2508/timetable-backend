import { ApiProperty } from '@nestjs/swagger';

export class CreateGoogleCalendarDto {
  // Шифр групи або ПІБ викладача
  @ApiProperty()
  owner: string;
}
