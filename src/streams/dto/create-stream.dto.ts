import { ApiProperty } from '@nestjs/swagger';

export class CreateStreamDto {
  @ApiProperty()
  name: string;
}
