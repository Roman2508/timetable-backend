import { PartialType } from '@nestjs/swagger';
import { CreateTeacherReportDto } from './create-teacher-report.dto';

export class UpdateTeacherReportDto extends PartialType(CreateTeacherReportDto) {}
