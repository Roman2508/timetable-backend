import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditoryCategoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;
}
