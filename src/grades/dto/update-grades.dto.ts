import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { GradeBookSummaryTypes } from 'src/grade-book/entities/grade-book.entity';

export class UpdateGradesDto {
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
  summaryType: null | GradeBookSummaryTypes;
}
