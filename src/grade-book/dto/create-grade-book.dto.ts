import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { LessonsTypeRu } from '../entities/grade-book.entity';

export class CreateGradeBookDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'lesson ID is required' })
  @IsNumber()
  lessonId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'group ID is required' })
  @IsNumber()
  groupId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'lesson type is required' })
  @IsString()
  typeRu: LessonsTypeRu;

  @ApiProperty()
  @IsNotEmpty({ message: 'year is required' })
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'semester is required' })
  @IsNumber()
  semester: 1 | 2;
}
