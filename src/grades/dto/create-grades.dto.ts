import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGradesDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'student ID is required' })
  @IsNumber()
  studentId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'grade book ID required' })
  @IsNumber()
  gradeBookId: number;
}
