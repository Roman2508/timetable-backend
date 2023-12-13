import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-plan.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiProperty()
  name: string;
}
