import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';

export class CreateGradeBookDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'group ID is required' })
  @IsNumber()
  groupId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'lessons is required' })
  groupLoadLessons: GroupLoadLessonEntity[];
}
