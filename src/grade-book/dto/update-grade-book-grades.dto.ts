import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateGradeBookGradesDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'lesson number is required' })
  @IsNumber()
  lessonNumber: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'isAbsence is required' })
  @IsBoolean()
  isAbsence: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: 'rating is required' })
  @IsNumber()
  rating: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'lesson date is required' })
  @IsString()
  lessonDate: string;
}
