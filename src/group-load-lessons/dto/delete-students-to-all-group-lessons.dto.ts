import { PartialType } from '@nestjs/swagger';

import { AddStudentsToAllGroupLessonsDto } from './add-students-to-all-group-lessons.dto';

export class DeleteStudentsFromAllGroupLessonsDto extends PartialType(AddStudentsToAllGroupLessonsDto) {}
