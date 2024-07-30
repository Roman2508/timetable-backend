import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { IndividualTeacherWordTypes } from '../entities/individual-teacher-work.entity';

export class CreateIndividualTeacherWorkDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'type is required' })
  type: IndividualTeacherWordTypes;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'hours is required' })
  hours: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'date is required' })
  date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'description is required' })
  description: string;
}
