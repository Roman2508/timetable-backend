import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  @IsString()
  @IsNotEmpty({ message: 'date is required' })
  doneDate: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'files is required' })
  files?: string[];
}
