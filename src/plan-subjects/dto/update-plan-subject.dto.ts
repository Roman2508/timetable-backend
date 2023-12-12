import { PartialType } from '@nestjs/swagger';
import { CreatePlanSubjectDto } from './create-plan-subject.dto';

export class UpdatePlanSubjectDto extends PartialType(CreatePlanSubjectDto) {}
