import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IndividualTeacherWordTypes } from 'src/individual-teacher-work/entities/individual-teacher-work.entity';

export class CreateTeacherReportDto {
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
  @IsBoolean()
  @IsNotEmpty({ message: 'status is required' })
  status: boolean;

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
