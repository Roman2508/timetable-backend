import { IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

import { CreateStudentDto } from './create-student.dto';
import { StudentStatus } from '../entities/student.entity';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiProperty()
  @IsEnum(StudentStatus)
  status: StudentStatus;
}
