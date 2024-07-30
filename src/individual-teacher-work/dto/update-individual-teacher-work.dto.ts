import { PartialType } from '@nestjs/swagger';
import { CreateIndividualTeacherWorkDto } from './create-individual-teacher-work.dto';

export class UpdateIndividualTeacherWorkDto extends PartialType(CreateIndividualTeacherWorkDto) {}
