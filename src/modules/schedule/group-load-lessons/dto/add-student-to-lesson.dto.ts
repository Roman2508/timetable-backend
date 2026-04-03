import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddStudentToLessonDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'student ID is required' })
  studentIds: number[];

  @ApiProperty()
  @IsNotEmpty({ message: 'lesson ID is required' })
  @IsNumber()
  lessonId: number;
}
