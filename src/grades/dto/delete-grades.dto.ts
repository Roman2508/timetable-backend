import { PartialType } from '@nestjs/swagger';
import { CreateGradesDto } from './create-grades.dto';

export class DeleteGradesDto extends PartialType(CreateGradesDto) {}
