import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateGroupLoadLessonDto } from './create-group-load-lesson.dto';

export class UpdateGroupLoadLessonNameDto {
  @ApiProperty()
  planSubjectId: number;

  @ApiProperty()
  oldName: string;

  @ApiProperty()
  newName: string;

  @ApiProperty()
  cmk: number;
}
