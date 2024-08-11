import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTeacherReportDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'teacher ID is required' })
  teacher: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'individual work item ID is required' })
  individualWork: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'hours is required' })
  hours: number;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'date is required' })
  plannedDate: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'year is required' })
  year: number;
}
