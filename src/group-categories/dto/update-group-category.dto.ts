import { PartialType } from '@nestjs/swagger';
import { CreateGroupCategoryDto } from './create-group-category.dto';

export class UpdateGroupCategoryDto extends PartialType(CreateGroupCategoryDto) {}
