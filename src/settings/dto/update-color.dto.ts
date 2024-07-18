import { ApiProperty } from '@nestjs/swagger';

export class UpdateColorDto {
  @ApiProperty()
  lectures: string;

  @ApiProperty()
  practical: string;

  @ApiProperty()
  laboratory: string;

  @ApiProperty()
  seminars: string;

  @ApiProperty()
  exams: string;
}
