import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupCategoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;
}
