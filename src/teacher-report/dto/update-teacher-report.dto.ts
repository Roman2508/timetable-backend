import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateTeacherReportDto {
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
