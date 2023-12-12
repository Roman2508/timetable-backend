import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePlanSubjectDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Загальна кількість годин - обов`язкове поле' })
  @IsNumber()
  totalHours: number;

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

  @ApiProperty()
  @IsNotEmpty({ message: 'ID навчального плану - обов`язкове поле' })
  @IsNumber()
  planId: number;
}
