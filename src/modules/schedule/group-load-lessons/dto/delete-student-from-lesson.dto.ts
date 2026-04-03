import { PartialType } from '@nestjs/swagger';

import { AddStudentToLessonDto } from './add-student-to-lesson.dto';

export class DeleteStudentFromLessonDto extends PartialType(AddStudentToLessonDto) {}
