import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TeachersService } from './teachers.service';
import { TeacherEntity } from './entities/teacher.entity';
import { TeachersController } from './teachers.controller';
import { GoogleDriveModule } from 'src/google-drive/google-drive.module';
import { GoogleCalendarModule } from 'src/google-calendar/google-calendar.module';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService],
  imports: [TypeOrmModule.forFeature([TeacherEntity]), GoogleCalendarModule, GoogleDriveModule],
})
export class TeachersModule {}
