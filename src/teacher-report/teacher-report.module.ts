import { Module } from '@nestjs/common';
import { TeacherReportService } from './teacher-report.service';
import { TeacherReportController } from './teacher-report.controller';

@Module({
  controllers: [TeacherReportController],
  providers: [TeacherReportService],
})
export class TeacherReportModule {}
