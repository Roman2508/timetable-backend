import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGradesDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'student ID is required' })
  studentIds: number[];

  @ApiProperty()
  @IsNotEmpty({ message: 'lesson ID required' })
  @IsNumber()
  lessonId: number;
}
