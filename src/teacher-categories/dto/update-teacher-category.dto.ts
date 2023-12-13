import { PartialType } from '@nestjs/swagger';
import { CreateTeacherCategoryDto } from './create-teacher-category.dto';

export class UpdateTeacherCategoryDto extends PartialType(CreateTeacherCategoryDto) {}
