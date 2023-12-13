import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePlanSubjectDto } from './create-plan-subject.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePlanSubjectHoursDto extends PartialType(
  CreatePlanSubjectDto,
) {
  @ApiProperty()
  @IsNotEmpty({ message: 'Номер семестру - обов`язкове поле' })
  @IsNumber()
  semesterNumber: number;

  @ApiProperty()
  @IsNumber()
  lectures?: number;

  @ApiProperty()
  @IsNumber()
  practical?: number;

  @ApiProperty()
  @IsNumber()
  laboratory?: number;

  @ApiProperty()
  @IsNumber()
  seminars?: number;

  @ApiProperty()
  @IsNumber()
  exams?: number;

  @ApiProperty()
  @IsNumber()
  examsConsulation?: number;

  @ApiProperty()
  @IsNumber()
  metodologicalGuidance?: number;

  @ApiProperty()
  @IsNumber()
  independentWork?: number;
}
