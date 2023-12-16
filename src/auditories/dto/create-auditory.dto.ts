import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  seatsNumber: number;

  @ApiProperty()
  category: number;
}
