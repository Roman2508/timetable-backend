import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

import { CreatePlanDto } from './create-plan.dto';
import { PlansStatus } from '../entities/plan.entity';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiProperty()
  status: PlansStatus;
}
