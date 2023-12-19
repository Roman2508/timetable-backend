import { PartialType } from '@nestjs/swagger';
import { CreateGroupLoadLessonDto } from './create-group-load-lesson.dto';

export class UpdateGroupLoadLessonDto extends PartialType(CreateGroupLoadLessonDto) {}
