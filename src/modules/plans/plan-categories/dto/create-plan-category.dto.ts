import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanCategoryDto {
  @ApiProperty()
  name: string;
}
