import { PartialType } from '@nestjs/swagger';
import { CreateAuditoryCategoryDto } from './create-auditory-category.dto';

export class UpdateAuditoryCategoryDto extends PartialType(CreateAuditoryCategoryDto) {}
