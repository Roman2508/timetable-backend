import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherCategoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;
}
