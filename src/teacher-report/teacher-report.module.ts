import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TeacherReportService } from './teacher-report.service';
import { TeacherReportController } from './teacher-report.controller';
import { TeacherReportEntity } from './entities/teacher-report.entity';
import { GoogleDriveModule } from 'src/google-drive/google-drive.module';

@Module({
  controllers: [TeacherReportController],
  providers: [TeacherReportService],
  imports: [TypeOrmModule.forFeature([TeacherReportEntity]), GoogleDriveModule],
})
export class TeacherReportModule {}
